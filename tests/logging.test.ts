import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {mkdtemp, readdir, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {test} from 'node:test';
import {setImmediate} from 'node:timers/promises';

import {ChatInputCommandInteraction, Events, Message} from 'discord.js';
import type {Client} from 'discord.js';
import {transports} from 'winston';
import type {Logger} from 'winston';
import {z} from 'zod';

import {config} from '../config.js';
import {createBot} from '../src/bot.ts';
import {parseConfig} from '../src/config.ts';
import {
    closeLogger, createAppLogger, createConsoleLogger, logError,
} from '../src/logger.ts';
import {installRuntimeErrorHandlers} from '../src/runtime-errors.ts';
import type {StatsApi} from '../src/stats.ts';

/** Validate Discord classes without inheriting their generic any defaults. */
function isMessage(value: unknown): value is Message {
    return value instanceof Message;
}

/** Validate an interaction across the supported guild and DM cache states. */
function isSlashInteraction(
    value: unknown,
): value is ChatInputCommandInteraction {
    return value instanceof ChatInputCommandInteraction;
}

const LOG_RECORD = z.object({
    timestamp: z.iso.datetime(), level: z.string(), message: z.string(),
    event: z.string().optional(), command: z.string().optional(),
    commandId: z.string().optional(), userId: z.string().optional(),
    userName: z.string().optional(), guildId: z.string().nullable().optional(),
    channelId: z.string().nullable().optional(), outcome: z.string().optional(),
    token: z.string().optional(),
    error: z.object({
        message: z.string(), stack: z.string(), code: z.string().optional(),
    }).optional(),
});

/** Collect processed records without printing fabricated errors to stderr. */
function capture(logger: Logger): unknown[] {
    const records: unknown[] = [];
    for (const transport of logger.transports) {
        if (transport instanceof transports.Console) {
            transport.silent = true;
        }
    }
    logger.on('data', (record: unknown) => records.push(record));
    return records;
}

/** Construct an offline Discord message using fabricated gateway data. */
function textMessage(client: Client, content: string, id: string): Message {
    const message: unknown = Reflect.construct(Message, [client, {
        id, channel_id: '100000000000000002', content,
        author: {
            id: '100000000000000001', username: 'test-user',
            discriminator: '0', bot: false,
        },
    }]);
    assert.ok(isMessage(message));
    return message;
}

/** Construct an offline slash command with one optional player argument. */
function slashInteraction(
    client: Client, subcommand: string, id: string,
): ChatInputCommandInteraction {
    const interaction: unknown = Reflect.construct(ChatInputCommandInteraction,
        [client, {
            id, type: 2, application_id: '100000000000000003',
            token: 'fabricated-interaction-token', locale: 'en-US',
            channel: {id: '100000000000000002'},
            user: {
                id: '100000000000000001', username: 'test-user',
                discriminator: '0', bot: false,
            },
            entitlements: [], authorizing_integration_owners: {},
            data: {
                id: '100000000000000004', name: 'r6', type: 1,
                options: [{
                    type: 1, name: subcommand,
                    options: subcommand === 'profile' ?
                        [{type: 3, name: 'player', value: 'MP7'}] : [],
                }],
            },
        }]);
    assert.ok(isSlashInteraction(interaction));
    return interaction;
}

await test('flushes timestamped command logs and redacts credentials', async (context) => {
    const root = resolve(tmpdir());
    const directory = await mkdtemp(join(root, 'r6bot-logs-'));
    const token = 'fabricated-bot-token';
    const logger = createAppLogger({...config.logging, directory}, token);
    capture(logger);
    context.after(async () => {
        await closeLogger(logger);
        assert.equal(dirname(directory), root);
        await rm(directory, {recursive: true, force: true});
    });
    const commandLogger = logger.child({userId: 'example-user', command: '+r6 MP7'});
    commandLogger.info('Command received', {token});
    logError(commandLogger, 'Example failure',
        Object.assign(new Error(`Failed with ${token}`), {code: 'ETEST'}));
    await closeLogger(logger);

    const file = (await readdir(directory)).find((name) => name.endsWith('.log'));
    assert.ok(file);
    const output = await readFile(join(directory, file), 'utf8');
    assert.ok(!output.includes(token));
    const records = output.trim().split('\n').map((line) =>
        LOG_RECORD.parse(JSON.parse(line)));
    assert.equal(records.length, 2);
    assert.equal(records[0]?.userId, 'example-user');
    assert.equal(records[0]?.command, '+r6 MP7');
    assert.equal(records[0]?.token, '[REDACTED]');
    assert.equal(records[1]?.error?.code, 'ETEST');
    assert.match(records[1]?.error?.stack ?? '', /at /u);
});

await test('isolates rejected work and requests recovery for process exceptions', async () => {
    const logger = createConsoleLogger();
    const records = capture(logger);
    const events = new EventEmitter();
    let fatalCalls = 0;
    const remove = installRuntimeErrorHandlers(
        logger, () => fatalCalls++, events,
    );
    events.emit('unhandledRejection', new Error('Example rejection'));
    assert.equal(fatalCalls, 0);
    events.emit('warning', new Error('Example warning'));
    events.emit('uncaughtException', new Error('Example exception'), 'uncaughtException');
    assert.equal(fatalCalls, 1);
    remove();
    assert.equal(events.listenerCount('unhandledRejection'), 0);
    assert.equal(events.listenerCount('uncaughtException'), 0);
    await closeLogger(logger);
    assert.deepEqual(records.map((record) => LOG_RECORD.parse(record).event), [
        'unhandled_rejection', 'process_warning', 'uncaught_exception',
    ]);
});

await test('logs both command transports and serves later commands after failures', async (context) => {
    const logger = createConsoleLogger();
    const records = capture(logger);
    const api: StatsApi = {
        getOverview: () => Promise.reject(new Error('Example query failure')),
        getPlaylist: () => Promise.reject(new Error('Example query failure')),
        getOperator: () => Promise.reject(new Error('Example query failure')),
    };
    const client = createBot(parseConfig({...config, requestCooldownMs: 0}),
        api, logger, () => assert.fail('Command errors must not restart the bot.'));
    const gateway: EventEmitter = client;
    context.after(async () => {
        await client.destroy();
        await closeLogger(logger);
    });

    for (const [index, content] of ['+r6 MP7', '+r6 ping'].entries()) {
        const message = textMessage(client, content, `10000000000000001${index}`);
        context.mock.getter(message, 'channel', () => ({
            isSendable: (): boolean => true,
            sendTyping: (): Promise<void> =>
                Promise.reject(new Error('Example typing failure')),
        }));
        const reply = context.mock.method(message, 'reply', () => index === 0 ?
            Promise.reject(new Error('Example reply failure')) : Promise.resolve(message));
        gateway.emit(Events.MessageCreate, message);
        await setImmediate();
        assert.equal(reply.mock.callCount(), 1);
    }
    for (const [index, command] of ['profile', 'ping'].entries()) {
        const interaction = slashInteraction(client, command, `10000000000000002${index}`);
        context.mock.method(interaction, 'deferReply', () => {
            interaction.deferred = true;
            return Promise.resolve();
        });
        context.mock.method(interaction, 'editReply', () =>
            Promise.reject(new Error('Example slash reply failure')));
        const reply = context.mock.method(interaction, 'reply', () => Promise.resolve());
        gateway.emit(Events.InteractionCreate, interaction);
        await setImmediate();
        assert.equal(reply.mock.callCount(), index === 0 ? 0 : 1);
    }

    const parsed = records.map((record) => LOG_RECORD.parse(record));
    const received = parsed.filter((record) => record.event === 'command_received');
    assert.deepEqual(received.map((record) => record.command), [
        '+r6 MP7', '+r6 ping', '/r6 profile player:MP7', '/r6 ping',
    ]);
    assert.ok(received.every((record) => record.userName === 'test-user' &&
        record.userId === '100000000000000001' && record.guildId === null &&
        record.channelId === '100000000000000002'));
    assert.deepEqual(parsed.filter((record) => record.event === 'command_completed')
        .map((record) => record.outcome), [
        'delivery_failure', 'success', 'delivery_failure', 'success',
    ]);
    assert.ok(parsed.some((record) => record.event === 'typing_failed'));
    assert.ok(parsed.some((record) => record.error?.message === 'Example query failure'));
    assert.ok(parsed.some((record) => record.error?.message === 'Example slash reply failure'));
});
