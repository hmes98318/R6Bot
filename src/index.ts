import {resolve} from 'node:path';

import type {Client} from 'discord.js';
import {createClient} from 'r6s-stats-api';

import {createBot, loginBot} from './bot.ts';
import {loadBotToken, loadConfig} from './config.ts';
import {
    closeLogger, createAppLogger, createConsoleLogger, logError,
} from './logger.ts';
import {installRuntimeErrorHandlers} from './runtime-errors.ts';
import {registerSlashCommands} from './slash-commands.ts';

/** Own the Discord session and the reusable statistics browser lifecycle. */
async function main(): Promise<void> {
    const token = loadBotToken();
    const config = await loadConfig();
    const logger = createAppLogger(config.logging, token);
    let api: ReturnType<typeof createClient> | undefined;
    let bot: Client | undefined;
    let shutdownPromise: Promise<void> | undefined;

    /** Release both resource owners and bound termination time. */
    async function closeResources(reason: string): Promise<void> {
        logger.info('Bot shutting down', {event: 'shutdown', reason});
        const deadline = setTimeout(() => {
            logger.error('Bot shutdown timed out', {event: 'shutdown_timeout'});
            process.exit(1);
        }, 15_000);
        deadline.unref();
        try {
            const results = await Promise.allSettled([
                Promise.resolve().then(() => bot?.destroy()),
                Promise.resolve().then(() => api?.close()),
            ]);
            for (const result of results) {
                if (result.status === 'rejected') {
                    logError(logger, 'Bot resource cleanup failed', result.reason);
                    process.exitCode = 1;
                }
            }
            await closeLogger(logger);
        } finally {
            clearTimeout(deadline);
            removeErrorHandlers();
            process.off('SIGINT', handleSignal);
            process.off('SIGTERM', handleSignal);
            process.off('disconnect', handleSignal);
        }
    }

    /** Share cleanup across startup errors and repeated termination signals. */
    function shutdown(reason: string, exitCode: 0 | 1): void {
        if (exitCode === 1) {
            process.exitCode = 1;
        }
        shutdownPromise ??= closeResources(reason);
        void shutdownPromise.then(() => process.exit(process.exitCode ?? 0),
            (error: unknown) => {
                logError(logger, 'Bot shutdown failed', error);
                process.exit(1);
            });
    }

    /** Stop an invalid or unsafe session so the supervisor can replace it. */
    function restart(): void {
        shutdown('fatal_error', 1);
    }

    /** Stop on termination signals or supervisor disconnection. */
    function handleSignal(): void {
        shutdown('termination_signal', 0);
    }

    const removeErrorHandlers = installRuntimeErrorHandlers(logger, restart);
    for (const signal of ['SIGINT', 'SIGTERM'] as const) {
        process.on(signal, handleSignal);
    }
    process.once('disconnect', handleSignal);
    if (process.send !== undefined && !process.connected) {
        handleSignal();
        return;
    }
    try {
        logger.info('Bot starting', {
            event: 'startup', name: config.name, nodeVersion: process.version,
        });
        api = createClient(config.api);
        bot = createBot(config, api, logger, restart);
        const readyBot = await loginBot(bot, token);
        if (shutdownPromise !== undefined) {
            return;
        }
        await registerSlashCommands(
            readyBot.rest, readyBot.application.id, config,
        );
        logger.info('Discord session ready', {
            event: 'ready', botUser: readyBot.user.tag,
        });
    } catch (error: unknown) {
        if (shutdownPromise === undefined) {
            logError(logger, 'Bot startup failed', error, {event: 'startup_failed'});
            shutdown('startup_failure', 1);
        }
    }
}

/** Importing the worker lets watch mode track files without starting a bot. */
if (process.argv[1] !== undefined &&
    resolve(process.argv[1]) === import.meta.filename) {
    void main().catch(async (error: unknown) => {
        const logger = createConsoleLogger(process.env['BOT_TOKEN'] ?? '');
        logError(logger, 'Bot bootstrap failed', error);
        await closeLogger(logger);
        process.exitCode = 1;
    });
}
