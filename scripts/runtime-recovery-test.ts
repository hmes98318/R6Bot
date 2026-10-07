import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {mkdtemp, readdir, readFile, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {setTimeout} from 'node:timers/promises';
import {pathToFileURL} from 'node:url';

import {z} from 'zod';

import {closeLogger, createConsoleLogger, logError} from '../src/logger.ts';
import {superviseWorker} from '../src/supervisor.ts';

/** Generate a TypeScript worker that fails once without external services. */
function workerSource(directory: string): string {
    const loggerUrl = new URL('../src/logger.ts', import.meta.url).href;
    const errorsUrl = new URL('../src/runtime-errors.ts', import.meta.url).href;
    return `
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {createAppLogger, closeLogger} from ${JSON.stringify(loggerUrl)};
import {installRuntimeErrorHandlers} from ${JSON.stringify(errorsUrl)};

const directory = ${JSON.stringify(directory)};
const countFile = join(directory, 'attempts');
const attempt = (existsSync(countFile) ? Number(readFileSync(countFile)) : 0) + 1;
writeFileSync(countFile, String(attempt));
const logger = createAppLogger({
    level: 'info', directory: join(directory, 'logs'),
    maxSizeMb: 10, retentionDays: 14,
});
let keepAlive: NodeJS.Timeout | undefined;

/** Flush diagnostics before a synthetic worker exits. */
function stop(code: 0 | 1): void {
    clearInterval(keepAlive);
    removeHandlers();
    void closeLogger(logger).then(() => process.exit(code), () => process.exit(1));
}

const removeHandlers = installRuntimeErrorHandlers(logger, () => stop(1));
process.once('disconnect', () => stop(0));
logger.info('Synthetic command received', {
    event: 'command_received', userId: 'example-user', command: '+r6 ping',
});
if (attempt === 1) {
    queueMicrotask(() => {
        throw new Error('Synthetic uncaught exception');
    });
} else {
    void Promise.reject(new Error('Synthetic unhandled rejection'));
    keepAlive = setInterval(() => {}, 1_000);
    setTimeout(() => {
        logger.info('Synthetic command completed after rejection', {
            event: 'command_completed', outcome: 'success',
        });
        writeFileSync(join(directory, 'ready'), 'ready');
    }, 50);
}
`;
}

/** Exercise real process recovery and clean up one isolated temp directory. */
async function main(): Promise<void> {
    const args = process.argv.slice(2);
    if (args.length === 1 && (args[0] === '--help' || args[0] === '-h')) {
        console.log('Usage: npm run runtime:smoke');
        console.log('Checks process recovery with synthetic errors and no Discord login.');
        return;
    }
    if (args.length > 0) {
        throw new Error('runtime:smoke does not accept arguments.');
    }
    const root = resolve(tmpdir());
    const directory = await mkdtemp(join(root, 'r6bot-recovery-'));
    const logger = createConsoleLogger();
    let supervision: Promise<void> | undefined;
    try {
        const worker = join(directory, 'recovery-worker.ts');
        await writeFile(worker, workerSource(directory));
        supervision = superviseWorker(pathToFileURL(worker), logger);
        const deadline = Date.now() + 15_000;
        while (!existsSync(join(directory, 'ready'))) {
            assert.ok(Date.now() < deadline, 'Worker did not recover in time.');
            await setTimeout(50);
        }
        process.emit('SIGTERM');
        await supervision;
        assert.equal(await readFile(join(directory, 'attempts'), 'utf8'), '2');
        const logDirectory = join(directory, 'logs');
        const files = (await readdir(logDirectory))
            .filter((file) => file.endsWith('.log'));
        const events = new Set<string>();
        for (const file of files) {
            const output = await readFile(join(logDirectory, file), 'utf8');
            for (const line of output.trim().split('\n')) {
                const record = z.object({
                    timestamp: z.iso.datetime(), event: z.string(),
                }).parse(JSON.parse(line));
                events.add(record.event);
            }
        }
        assert.ok(events.has('uncaught_exception'));
        assert.ok(events.has('unhandled_rejection'));
        assert.ok(events.has('command_completed'));
        console.log('Fatal restart, rejection isolation, and log flushing passed.');
    } finally {
        if (supervision !== undefined) {
            process.emit('SIGTERM');
            await supervision;
        }
        await closeLogger(logger);
        assert.equal(dirname(directory), root);
        await rm(directory, {recursive: true, force: true});
    }
}

try {
    await main();
} catch (error: unknown) {
    const logger = createConsoleLogger();
    logError(logger, 'Runtime recovery test failed', error);
    await closeLogger(logger);
    process.exitCode = 1;
}
