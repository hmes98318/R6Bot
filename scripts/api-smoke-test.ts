import {createClient, R6StatsError} from 'r6s-stats-api';

import {createQuery} from '../src/commands.ts';
import {loadConfig} from '../src/config.ts';
import {scriptError} from './docker.ts';

/** Manually exercise live profile access without logging in to Discord. */
async function main(): Promise<void> {
    const args = process.argv.slice(2);
    if (args.length === 1 && (args[0] === '--help' || args[0] === '-h')) {
        console.log('Usage: npm run api:smoke -- <pc|ubi|xbox|xbl|psn> "Player Name"');
        return;
    }
    const [platform, username] = args;
    if (args.length !== 2 || platform === undefined || username === undefined) {
        throw new Error('Provide a platform and one player name; use --help for usage.');
    }
    const config = await loadConfig();
    const query = createQuery({
        platform, username, mode: 'profile', operator: null, season: null,
    }, config);
    const client = createClient(config.api);
    try {
        const result = await client.getOverview(query.platform, query.username);
        console.log(JSON.stringify({
            sourceUrl: result.sourceUrl,
            fetchedAt: result.fetchedAt,
            player: result.data.player,
            overall: result.data.overall?.stats ?? null,
        }, null, 4));
    } finally {
        await client.close();
    }
}

try {
    await main();
} catch (error: unknown) {
    const message = error instanceof R6StatsError ?
        `${error.code} (HTTP ${error.status ?? 'unknown'})` : scriptError(error);
    console.error(`Live API smoke test failed: ${message}`);
    process.exitCode = 1;
}
