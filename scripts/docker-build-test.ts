import {z} from 'zod';

import {buildImage, getImageReference, runDocker, scriptError} from './docker.ts';

const IMAGE_CONFIG_SCHEMA = z.object({
    WorkingDir: z.literal('/bot'),
    User: z.literal('node'),
    Entrypoint: z.tuple([z.literal('node'), z.literal('--enable-source-maps')]),
    Cmd: z.tuple([z.literal('dist/run.js')]),
});

const RUNTIME_SMOKE = `
import assert from 'node:assert/strict';
import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {createRequire} from 'node:module';

process.env.PLAYWRIGHT_BROWSERS_PATH = '0';
for (const path of [
    '/bot/config.js', '/bot/dist/index.js', '/bot/package-lock.json',
    '/bot/dist/run.js', '/bot/dist/supervisor.js',
    '/bot/node_modules/discord.js/package.json',
    '/bot/node_modules/r6s-stats-api/dist/index.js',
    '/bot/node_modules/winston/package.json',
]) {
    assert.ok(existsSync(path), 'Missing runtime file: ' + path);
}
for (const path of [
    '/bot/.env', '/bot/src', '/bot/scripts', '/bot/tests',
    '/bot/node_modules/typescript',
]) {
    assert.ok(!existsSync(path), 'Unexpected production file: ' + path);
}
assert.equal(process.versions.node, '24.21.0');
const {loadConfig} = await import('./dist/config.js');
const {buildSlashCommands} = await import('./dist/slash-commands.js');
const config = await loadConfig();
assert.equal(buildSlashCommands(config)[0].name, 'r6');
await import('./dist/bot.js');
await import('./dist/stats.js');
const {createAppLogger, closeLogger} = await import('./dist/logger.js');
const logger = createAppLogger({
    ...config.logging, level: 'info', directory: '/bot/logs',
});
logger.info('Container logging smoke test', {event: 'logging_smoke'});
await closeLogger(logger);
const logFile = readdirSync('/bot/logs').find((name) => name.endsWith('.log'));
assert.ok(logFile, 'Missing rotating log output');
const logRecord = JSON.parse(readFileSync('/bot/logs/' + logFile, 'utf8').trim());
assert.equal(logRecord.event, 'logging_smoke');
assert.ok(!Number.isNaN(Date.parse(logRecord.timestamp)));
const {createClient} = await import('r6s-stats-api');
const client = createClient(config.api);
await client.close();

const require = createRequire(import.meta.url);
const requireFromApi = createRequire(require.resolve('r6s-stats-api'));
const {chromium} = requireFromApi('playwright');
const browser = await chromium.launch({headless: true, channel: 'chromium'});
try {
    const page = await browser.newPage();
    await page.setContent('<title>R6Bot smoke test</title>');
    assert.equal(await page.title(), 'R6Bot smoke test');
} finally {
    await browser.close();
}
console.log('Production runtime, log storage, and headless Chromium passed.');
`;

/** Check production image metadata independently of the container contents. */
async function verifyImage(imageReference: string): Promise<void> {
    const output = await runDocker([
        'image', 'inspect', '--format', '{{json .Config}}', imageReference,
    ], true);
    const configuration: unknown = JSON.parse(output);
    IMAGE_CONFIG_SCHEMA.parse(configuration);
    await runDocker([
        'run', '--rm', '--network', 'none', '--read-only',
        '--tmpfs', '/tmp:rw,nosuid,size=256m', '--shm-size', '256m',
        '--tmpfs', '/home/node:rw,nosuid,uid=1000,gid=1000,size=64m',
        '--tmpfs', '/bot/logs:rw,nosuid,uid=1000,gid=1000,size=16m',
        '--entrypoint', 'node', imageReference,
        '--input-type=module', '-e', RUNTIME_SMOKE,
    ]);
}

/** Build and remove one uniquely tagged image without Discord credentials. */
async function main(): Promise<void> {
    const args = process.argv.slice(2);
    if (args.length === 1 && (args[0] === '--help' || args[0] === '-h')) {
        console.log('Usage: npm run docker:build:test');
        console.log('Checks the Dockerfile, image, and isolated browser runtime.');
        return;
    }
    if (args.length > 0) {
        throw new Error('docker:build:test does not accept arguments.');
    }
    const imageReference = getImageReference(
        `r6bot:build-test-${process.pid}-${Date.now()}`,
    );
    let primaryError: Error | undefined;
    let imageBuilt = false;
    try {
        console.log('[1/4] Checking Dockerfile and Compose configuration...');
        await runDocker(['build', '--check', '.']);
        await runDocker(['compose', 'config', '--no-env-resolution', '--quiet']);
        console.log('[2/4] Building a temporary image...');
        await buildImage(imageReference);
        imageBuilt = true;
        console.log('[3/4] Checking metadata, runtime files, and Chromium...');
        await verifyImage(imageReference);
    } catch (error: unknown) {
        primaryError = error instanceof Error ? error :
            new Error(scriptError(error));
    } finally {
        if (imageBuilt) {
            console.log(`[4/4] Removing ${imageReference}...`);
            try {
                await runDocker(['image', 'rm', '--force', imageReference]);
            } catch (error: unknown) {
                if (primaryError !== undefined) {
                    console.error(`Image cleanup also failed: ${scriptError(error)}`);
                } else {
                    primaryError = error instanceof Error ? error :
                        new Error(scriptError(error));
                }
            }
        }
    }
    if (primaryError !== undefined) {
        throw primaryError;
    }
    console.log('Docker build test passed.');
}

try {
    await main();
} catch (error: unknown) {
    console.error(`Docker build test failed: ${scriptError(error)}`);
    process.exitCode = 1;
}
