import {
    ApplicationIntegrationType, InteractionContextType, Routes,
    SlashCommandBuilder, SlashCommandSubcommandBuilder,
} from 'discord.js';
import type {
    ChatInputCommandInteraction, REST,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    SlashCommandStringOption,
} from 'discord.js';

import {createQuery} from './commands.ts';
import type {BotCommand} from './commands.ts';
import type {BotConfig} from './config.ts';
import {CommandError} from './errors.ts';

/** Shared name for registration and Discord interaction routing. */
export const SLASH_COMMAND_NAME = 'r6';

/** Only option readers are required to normalize a slash interaction. */
type SlashInteraction = {
    options: Pick<
        ChatInputCommandInteraction['options'], 'getSubcommand' | 'getString'
    >;
};

/** Add the common required username argument. */
function playerOption(
    option: SlashCommandStringOption,
): SlashCommandStringOption {
    return option
        .setName('player')
        .setDescription('Player account name')
        .setRequired(true)
        .setMinLength(1)
        .setMaxLength(64);
}

/** Offer only playlists supported by the shared statistics executor. */
function modeOption(
    option: SlashCommandStringOption,
): SlashCommandStringOption {
    return option
        .setName('mode')
        .setDescription('Game mode')
        .setRequired(true)
        .addChoices(
            {name: 'Ranked', value: 'ranked'},
            {name: 'Casual / Quick Match', value: 'quick-match'},
            {name: 'Unranked', value: 'unranked'},
            {
                name: 'Combined Unranked + Quick Match',
                value: 'unranked-and-quick-match',
            },
            {name: 'Dual Front', value: 'dual-front'},
            {name: 'Siege Cup', value: 'siege-cup'},
            {name: 'Arcade', value: 'arcade'},
            {name: 'Event', value: 'event'},
        );
}

/** Put the platform after required arguments and before optional arguments. */
function addPlatform(
    subcommand: SlashCommandSubcommandBuilder, config: BotConfig,
): SlashCommandSubcommandBuilder {
    return subcommand.addStringOption((option) => option
        .setName('platform')
        .setDescription('Account platform')
        .setRequired(config.defaultPlatform === null)
        .addChoices(
            {name: 'PC / Ubisoft', value: 'ubi'},
            {name: 'PlayStation', value: 'psn'},
            {name: 'Xbox', value: 'xbl'},
        ));
}

/** Build a lifetime profile query with the common identity options. */
function buildProfile(config: BotConfig): SlashCommandSubcommandBuilder {
    return addPlatform(new SlashCommandSubcommandBuilder()
        .setName('profile')
        .setDescription('Player profile and lifetime overall statistics')
        .addStringOption(playerOption), config);
}

/** Put the optional season after player, mode, and platform options. */
function buildStats(config: BotConfig): SlashCommandSubcommandBuilder {
    const subcommand = new SlashCommandSubcommandBuilder()
        .setName('stats')
        .setDescription('Statistics for a mode and season')
        .addStringOption(playerOption)
        .addStringOption(modeOption);
    return addPlatform(subcommand, config)
        .addStringOption((option) => option
            .setName('season')
            .setDescription('current (default), all, or YxSx (for example Y9S1)')
            .setMaxLength(16));
}

/** Build a cumulative operator query without a single-season option. */
function buildOperator(config: BotConfig): SlashCommandSubcommandBuilder {
    const subcommand = new SlashCommandSubcommandBuilder()
        .setName('operator')
        .setDescription('One operator’s recorded performance')
        .addStringOption(playerOption)
        .addStringOption((option) => option
            .setName('operator')
            .setDescription('Operator name, for example ace')
            .setRequired(true)
            .setMinLength(1)
            .setMaxLength(64));
    return addPlatform(subcommand, config);
}

/** Build the application's complete slash-command registration. */
export function buildSlashCommands(
    config: BotConfig,
): RESTPostAPIChatInputApplicationCommandsJSONBody[] {
    const command = new SlashCommandBuilder()
        .setName(SLASH_COMMAND_NAME)
        .setDescription('Rainbow Six Siege player statistics')
        .setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
        .setContexts(InteractionContextType.Guild, InteractionContextType.BotDM)
        .addSubcommand(buildProfile(config))
        .addSubcommand(buildStats(config))
        .addSubcommand(buildOperator(config))
        .addSubcommand((subcommand) => subcommand
            .setName('help').setDescription('Command usage and examples'))
        .addSubcommand((subcommand) => subcommand
            .setName('ping').setDescription('Check the bot’s gateway latency'));
    return [command.toJSON()];
}

/** Register global commands through the authenticated REST manager. */
export async function registerSlashCommands(
    rest: Pick<REST, 'put'>, applicationId: string, config: BotConfig,
): Promise<void> {
    if (config.commands.slash) {
        await rest.put(Routes.applicationCommands(applicationId), {
            body: buildSlashCommands(config),
        });
    }
}

/** Normalize Discord options using the same validation as text commands. */
export function parseSlashCommand(
    interaction: SlashInteraction, config: BotConfig,
): BotCommand {
    const subcommand = interaction.options.getSubcommand();
    if (subcommand === 'help' || subcommand === 'ping') {
        return {kind: subcommand};
    }
    if (!['profile', 'stats', 'operator'].includes(subcommand)) {
        throw new CommandError('Unknown subcommand. Use /r6 help for examples.');
    }
    return createQuery({
        platform: interaction.options.getString('platform'),
        username: interaction.options.getString('player', true),
        mode: subcommand === 'stats' ?
            interaction.options.getString('mode', true) : subcommand,
        operator: subcommand === 'operator' ?
            interaction.options.getString('operator', true) : null,
        season: subcommand === 'stats' ?
            interaction.options.getString('season') : null,
    }, config);
}
