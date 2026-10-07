import {once} from 'node:events';
import {mkdirSync, writeSync} from 'node:fs';
import {resolve} from 'node:path';

import {createLogger, format, transports} from 'winston';
import type {Logger} from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import {R6StatsError} from 'r6s-stats-api';

import type {BotConfig} from './config.ts';
import {CommandError} from './errors.ts';

/** Small, explicit command and lifecycle fields suitable for log metadata. */
export type LogContext = Record<string, string | number | boolean | null>;

const pendingCloses = new WeakMap<Logger, Promise<void>>();

/** Capture useful diagnostics without serializing requests or responses. */
function errorDetails(error: unknown): Record<string, unknown> {
    if (!(error instanceof Error)) {
        return {name: 'UnknownError', message: typeof error === 'string' ?
            error : 'A non-Error value was thrown.'};
    }
    const message = error instanceof R6StatsError ?
        `${error.code} (HTTP ${error.status ?? 'unknown'})` : error.message;
    const frames = error.stack?.split('\n').filter((line) =>
        /^\s+at /u.test(line)) ?? [];
    const details: Record<string, unknown> = {
        name: error.name, message,
        stack: [`${error.name}: ${message}`, ...frames].join('\n'),
    };
    if ('code' in error &&
        (typeof error.code === 'string' || typeof error.code === 'number')) {
        details['code'] = error.code;
    }
    if ('status' in error && typeof error.status === 'number') {
        details['status'] = error.status;
    }
    return details;
}

/** Escape records and remove credentials before writing either output. */
function serialize(value: unknown, token: string): string {
    return JSON.stringify(value, (key: string, item: unknown): unknown => {
        if (/^(?:bot_token|token|authorization|cookie|password|secret)$/iu.test(key)) {
            return '[REDACTED]';
        }
        return typeof item === 'string' && token.length > 0 ?
            item.replaceAll(token, '[REDACTED]') : item;
    }) ?? '{}';
}

/** Report transport failures without recursively depending on the logger. */
function emergencyLog(error: unknown, token: string): void {
    try {
        writeSync(2, serialize({
            timestamp: new Date().toISOString(), level: 'error',
            message: 'Logging transport failed', error: errorDetails(error),
        }, token) + '\n');
    } catch {
        /** An unavailable stderr must not become another uncaught error. */
    }
}

/** Create a timestamped console logger with safe bootstrap diagnostics. */
export function createConsoleLogger(token = '', level = 'info'): Logger {
    const logger = createLogger({
        level,
        defaultMeta: {pid: process.pid},
        format: format.combine(format.timestamp(),
            format.printf((entry) => serialize(entry, token))),
        transports: [new transports.Console({
            stderrLevels: ['error'], consoleWarnLevels: ['warn'],
        })],
    });
    logger.on('error', (error: unknown) => emergencyLog(error, token));
    return logger;
}

/** Add bounded daily file storage to the bot's console logging. */
export function createAppLogger(
    settings: BotConfig['logging'], token = '',
): Logger {
    const logger = createConsoleLogger(token, settings.level);
    if (settings.directory === null) {
        return logger;
    }
    try {
        const directory = resolve(settings.directory);
        mkdirSync(directory, {recursive: true});
        const file = new DailyRotateFile({
            dirname: directory, filename: 'r6bot-%DATE%.log',
            datePattern: 'YYYY-MM-DD', utc: true,
            maxSize: `${settings.maxSizeMb}m`,
            maxFiles: `${settings.retentionDays}d`,
        });
        let failed = false;

        /** Retain console logging even if the underlying file stream fails. */
        function handleFileError(error: unknown): void {
            logger.remove(file);
            if (failed) {
                return;
            }
            failed = true;
            logError(logger, 'File logging failed; using console output', error);
        }

        logger.add(file);
        file.on('error', handleFileError);
        file.logStream.on('error', handleFileError);
    } catch (error: unknown) {
        logError(logger, 'File logging could not start; using console output', error);
    }
    return logger;
}

/** Log validation warnings and unexpected errors with selected diagnostics. */
export function logError(
    logger: Logger, message: string, error: unknown, context: LogContext = {},
): void {
    logger.log({
        ...context, level: error instanceof CommandError ? 'warn' : 'error',
        message, error: errorDetails(error),
    });
}

/** Wait for both transport queues and the underlying rotating file streams. */
async function drainLogger(logger: Logger): Promise<void> {
    const files = logger.transports.filter((transport) =>
        transport instanceof DailyRotateFile);
    const finished = Promise.all([
        once(logger, 'finish'),
        ...files.map((file) => once(file.logStream, 'finish')),
    ]);
    logger.once('finish', () => logger.close());
    logger.end();
    try {
        await finished;
    } finally {
        logger.close();
    }
}

/** Share flushing across repeated shutdown or cleanup requests. */
export function closeLogger(logger: Logger): Promise<void> {
    let pending = pendingCloses.get(logger);
    if (pending === undefined) {
        pending = drainLogger(logger);
        pendingCloses.set(logger, pending);
    }
    return pending;
}
