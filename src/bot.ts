import {once} from 'node:events';

import {
    Client, Events, GatewayIntentBits, MessageFlags, Partials,
} from 'discord.js';
import type {ChatInputCommandInteraction, Message} from 'discord.js';
import type {Logger} from 'winston';

import {isTextCommand, parseTextCommand} from './commands.ts';
import type {BotCommand} from './commands.ts';
import type {BotConfig} from './config.ts';
import {logError} from './logger.ts';
import {RequestGate} from './request-gate.ts';
import {parseSlashCommand, SLASH_COMMAND_NAME} from './slash-commands.ts';
import {createErrorReply, executeCommand} from './stats.ts';
import type {CommandReply, StatsApi} from './stats.ts';
import {startTyping} from './typing.ts';

/** Wait for login and client readiness before accessing application state. */
export async function loginBot(
    client: Client, token: string,
): Promise<Client<true>> {
    const controller = new AbortController();
    const ready = once(client, Events.ClientReady, {signal: controller.signal});
    try {
        await Promise.all([client.login(token), ready]);
    } finally {
        controller.abort();
    }
    if (!client.isReady()) {
        throw new Error('Discord did not establish a ready session.');
    }
    return client;
}

/** Create Discord event handlers around the shared command executor. */
export function createBot(
    config: BotConfig, api: StatsApi, logger: Logger, onInvalidated: () => void,
): Client {
    const intents = [GatewayIntentBits.Guilds];
    if (config.commands.text) {
        intents.push(
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.DirectMessages,
            GatewayIntentBits.MessageContent,
        );
    }
    const client = new Client({
        intents,
        partials: config.commands.text ? [Partials.Channel] : [],
        allowedMentions: {parse: [], repliedUser: false},
    });
    const gate = new RequestGate(config);

    /** Local commands avoid the upstream request gate and cooldown. */
    async function execute(
        command: BotCommand, userId: string,
    ): Promise<CommandReply> {
        const work = (): Promise<CommandReply> =>
            executeCommand(command, config, api, client.ws.ping);
        return command.kind === 'help' || command.kind === 'ping' ?
            work() : gate.run(userId, work);
    }

    /** Ignore bot messages and reply to recognized text commands. */
    async function handleMessage(message: Message): Promise<void> {
        if (message.author.bot || message.webhookId !== null ||
            !isTextCommand(message.content, config)) {
            return;
        }
        const commandLogger = logger.child({
            transport: 'text', userId: message.author.id,
            userName: message.author.tag, guildId: message.guildId,
            channelId: message.channelId, commandId: message.id,
            command: message.content,
        });
        commandLogger.info('Command received', {event: 'command_received'});
        const started = Date.now();
        let outcome = 'success';
        let stopTyping: (() => void) | undefined;
        try {
            if (message.channel.isSendable()) {
                stopTyping = await startTyping(message.channel, commandLogger);
            }
            let reply: CommandReply;
            try {
                const command = parseTextCommand(message.content, config);
                if (command === null) {
                    return;
                }
                reply = await execute(command, message.author.id);
            } catch (error: unknown) {
                outcome = 'failure';
                logError(commandLogger, 'Text command failed', error, {
                    event: 'command_failed',
                });
                reply = createErrorReply(error, config);
            }
            await message.reply(reply);
        } catch (error: unknown) {
            outcome = 'delivery_failure';
            logError(commandLogger, 'Text reply failed', error, {
                event: 'reply_failed',
            });
        } finally {
            stopTyping?.();
            commandLogger.info('Command finished', {
                event: 'command_completed', outcome,
                durationMs: Date.now() - started,
            });
        }
    }

    /** Acknowledge queries before waiting for API or browser activity. */
    async function handleInteraction(
        interaction: ChatInputCommandInteraction,
    ): Promise<void> {
        const commandLogger = logger.child({
            transport: 'slash', userId: interaction.user.id,
            userName: interaction.user.tag, guildId: interaction.guildId,
            channelId: interaction.channelId, commandId: interaction.id,
            command: interaction.toString(),
        });
        commandLogger.info('Command received', {event: 'command_received'});
        const started = Date.now();
        let outcome = 'success';
        try {
            const command = parseSlashCommand(interaction, config);
            if (command.kind === 'help' || command.kind === 'ping') {
                const reply = await execute(command, interaction.user.id);
                await interaction.reply(reply);
                return;
            }
            await interaction.deferReply();
            const reply = await execute(command, interaction.user.id);
            await interaction.editReply(reply);
        } catch (error: unknown) {
            outcome = 'failure';
            logError(commandLogger, 'Slash command failed', error, {
                event: 'command_failed',
            });
            const reply = createErrorReply(error, config);
            try {
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply(reply);
                } else {
                    await interaction.reply({
                        ...reply, flags: MessageFlags.Ephemeral,
                    });
                }
            } catch (replyError: unknown) {
                outcome = 'delivery_failure';
                logError(commandLogger, 'Slash error reply failed', replyError, {
                    event: 'reply_failed',
                });
            }
        } finally {
            commandLogger.info('Command finished', {
                event: 'command_completed', outcome,
                durationMs: Date.now() - started,
            });
        }
    }

    if (config.commands.text) {
        client.on(Events.MessageCreate, (message) => {
            void handleMessage(message).catch((error: unknown) =>
                logError(logger, 'Unexpected text handler failure', error));
        });
    }
    if (config.commands.slash) {
        client.on(Events.InteractionCreate, (interaction) => {
            if (interaction.isChatInputCommand() &&
                interaction.commandName === SLASH_COMMAND_NAME) {
                void handleInteraction(interaction).catch((error: unknown) =>
                    logError(logger, 'Unexpected slash handler failure', error));
            }
        });
    }
    client.on(Events.Error, (error) =>
        logError(logger, 'Discord client error', error));
    client.on(Events.ShardError, (error, shardId) =>
        logError(logger, 'Discord shard error', error, {shardId}));
    client.on(Events.Warn, (message) =>
        logger.warn(message, {event: 'discord_warning'}));
    client.on(Events.ShardReconnecting, (shardId) =>
        logger.warn('Discord shard reconnecting', {
            event: 'discord_reconnecting', shardId,
        }));
    client.once(Events.Invalidated, () => {
        logger.error('Discord session invalidated; restarting bot', {
            event: 'session_invalidated',
        });
        onInvalidated();
    });
    return client;
}
