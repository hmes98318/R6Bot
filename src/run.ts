import {extname} from 'node:path';

import {loadBotToken, loadConfig} from './config.ts';
import {closeLogger, createConsoleLogger, logError} from './logger.ts';
import {superviseWorker} from './supervisor.ts';
import './index.ts';

/** Supervise the source or compiled worker and watch its imported modules. */
async function main(): Promise<void> {
    const token = loadBotToken();
    const config = await loadConfig();
    const logger = createConsoleLogger(token, config.logging.level);
    const entry = new URL(
        `./index${extname(import.meta.filename)}`, import.meta.url,
    );
    try {
        await superviseWorker(entry, logger);
    } finally {
        await closeLogger(logger);
    }
}

try {
    await main();
} catch (error: unknown) {
    const logger = createConsoleLogger(process.env['BOT_TOKEN'] ?? '');
    logError(logger, 'Bot supervisor could not start', error);
    await closeLogger(logger);
    process.exitCode = 1;
}
