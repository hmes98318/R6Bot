import assert from 'node:assert/strict';
import {test} from 'node:test';

import {
    ApplicationCommandOptionType, ApplicationIntegrationType,
    InteractionContextType,
} from 'discord.js';
import type {REST} from 'discord.js';
import {R6StatsError} from 'r6s-stats-api';
import type {
    OperatorStats, PlayerOverview, Statistics, StatsSegment,
} from 'r6s-stats-api';

import {createQuery, parseTextCommand} from '../src/commands.ts';
import type {BotCommand} from '../src/commands.ts';
import {parseConfig, readBotToken} from '../src/config.ts';
import type {BotConfig} from '../src/config.ts';
import {CommandError, errorMessage} from '../src/errors.ts';
import {closeLogger, createConsoleLogger} from '../src/logger.ts';
import {RequestGate} from '../src/request-gate.ts';
import {
    buildSlashCommands, parseSlashCommand, registerSlashCommands,
} from '../src/slash-commands.ts';
import {createErrorReply, executeCommand} from '../src/stats.ts';
import type {StatsApi} from '../src/stats.ts';
import {startTyping} from '../src/typing.ts';

const config: BotConfig = {
    name: 'R6Bot', prefix: '+', color: '#ff00ee', defaultPlatform: 'ubi',
    commands: {text: true, slash: true},
    logging: {
        level: 'info', directory: null, maxSizeMb: 10, retentionDays: 14,
    },
    api: {
        timeoutMs: 20_000, cacheTtlMs: 60_000,
        minRequestIntervalMs: 1_000, retries: 1,
    },
    requestCooldownMs: 5_000, maxConcurrentQueries: 4,
};

const STATISTICS: Statistics = {
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    abandons: null,
    timePlayedSeconds: 0,
    kills: 0,
    deaths: 0,
    assists: null,
    headshots: 0,
    headshotPercentage: 0,
    kdRatio: null,
    winPercentage: null,
    killsPerMatch: null,
    roundsPlayed: 4,
    roundsWon: 2,
    roundsLost: 2,
    roundWinPercentage: 50,
    aces: null,
    teamKills: null,
};

const SEGMENT: StatsSegment = {
    type: 'season',
    name: 'Ranked',
    playlist: 'ranked',
    sourcePlaylist: 'pvp_ranked',
    season: {id: 33, name: 'Example season', shortName: null},
    stats: STATISTICS,
    rank: {
        name: 'Example rank', imageUrl: 'https://example.com/rank.png', tier: null,
        points: 0, pointsType: 'rp',
    },
    peakRank: null,
    metrics: {},
};

const PROVENANCE = {
    source: 'tracker-network' as const,
    sourceUrl: 'https://api.tracker.gg/api/v2/r6siege/standard/profile/ubi/Example',
    fetchedAt: '2026-01-01T00:00:00.000Z',
};

const OVERVIEW: PlayerOverview = {
    player: {
        platform: 'ubi', username: 'Example', userId: null,
        avatarUrl: 'https://example.com/avatar.png',
        profileUrl: PROVENANCE.sourceUrl,
    },
    clearanceLevel: 0, battlePassLevel: null, currentSeasonId: null,
    aliases: [], overall: null, playlists: [], seasons: [],
};

/** Fail on unexpected API methods so these tests cannot perform live work. */
function fakeApi(overrides: Partial<StatsApi> = {}): StatsApi {
    return {
        getOverview: () => Promise.reject(new Error('Unexpected profile call.')),
        getPlaylist: () => Promise.reject(new Error('Unexpected playlist call.')),
        getOperator: () => Promise.reject(new Error('Unexpected operator call.')),
        ...overrides,
    };
}

await test('validates public config and requires the new token variable', () => {
    assert.deepEqual(parseConfig(config), config);
    assert.equal(readBotToken({BOT_TOKEN: ' example-token '}), 'example-token');
    assert.throws(() => readBotToken({TOKEN: 'old-token'}), /BOT_TOKEN/u);
    assert.throws(() => readBotToken({BOT_TOKEN: 'your_token'}), /BOT_TOKEN/u);
    assert.throws(() => parseConfig({...config, color: 'invalid'}), /color/u);
    assert.throws(() => parseConfig({
        ...config, commands: {text: false, slash: false},
    }), /at least one/u);
});

await test('normalizes legacy text commands and quoted Xbox names', () => {
    assert.deepEqual(parseTextCommand('+r6 Example', config), {
        kind: 'profile', platform: 'ubi', username: 'Example',
    });
    assert.deepEqual(parseTextCommand('+r6 XBOX "Player Name" RANK y9s1', config), {
        kind: 'playlist', platform: 'xbl', username: 'Player Name',
        playlist: 'ranked', season: 33,
    });
    assert.deepEqual(parseTextCommand('+r6 psn Example operator ACE', config), {
        kind: 'operator', platform: 'psn', username: 'Example', operator: 'ace',
    });
    assert.deepEqual(parseTextCommand('+r6 Example casual', config), {
        kind: 'playlist', platform: 'ubi', username: 'Example',
        playlist: 'quick-match', season: 'current',
    });
});

await test('ignores unrelated messages and rejects important invalid inputs', () => {
    assert.equal(parseTextCommand('hello', config), null);
    assert.equal(parseTextCommand('+r6extra', config), null);
    for (const content of [
        '+r6 pc', '+r6 "Player Name', '+r6 Example rank -1',
        '+r6 Example operator', '+r6 Example __proto__',
        '+r6 Example rank current extra',
    ]) {
        assert.throws(() => parseTextCommand(content, config), CommandError);
    }
    assert.throws(() => parseTextCommand('+r6 Example deathmatch', config), /not supported/u);
    assert.throws(() => parseTextCommand('+r6 Example', {
        ...config, defaultPlatform: null,
    }), /platform/u);
});

await test('normalizes official season codes and rejects invalid formats', () => {
    const input = {
        platform: 'pc', username: 'Example', mode: 'rank', operator: null,
    };
    for (const [season, expected] of [
        ['y9s1', 33], ['Y1S1', 1], ['y10S4', 40], ['  y9s1  ', 33],
        ['CURRENT', 'current'], ['AlL', 'all'],
    ] as const) {
        assert.deepEqual(createQuery({...input, season}, config), {
            kind: 'playlist', platform: 'ubi', username: 'Example',
            playlist: 'ranked', season: expected,
        });
    }
    for (const season of [
        '33', 'Y0S1', 'Y09S1', 'Y9S0', 'Y9S5', 'Y9S01', 'Y9 S1',
        'Y2501S1', 'Y9007199254740991S4',
    ]) {
        assert.throws(() => createQuery({...input, season}, config), /Season/u);
    }
});

await test('builds slash definitions with required options before optional ones', () => {
    for (const defaultPlatform of ['ubi', null] as const) {
        const commands = buildSlashCommands({...config, defaultPlatform});
        assert.equal(commands[0]?.name, 'r6');
        assert.deepEqual(commands[0]?.integration_types,
            [ApplicationIntegrationType.GuildInstall]);
        assert.deepEqual(commands[0]?.contexts,
            [InteractionContextType.Guild, InteractionContextType.BotDM]);
        assert.deepEqual(commands[0]?.options?.map((option) => option.name),
            ['profile', 'stats', 'operator', 'help', 'ping']);
        for (const subcommand of commands[0]?.options ?? []) {
            if (subcommand.type !== ApplicationCommandOptionType.Subcommand) {
                continue;
            }
            if (subcommand.name === 'stats') {
                const season = subcommand.options?.find((option) =>
                    option.name === 'season');
                assert.equal(season?.type, ApplicationCommandOptionType.String);
                assert.match(season?.description ?? '', /Y9S1/u);
            }
            let optionalSeen = false;
            for (const option of subcommand.options ?? []) {
                if ('required' in option && option.required) {
                    assert.equal(optionalSeen, false);
                } else {
                    optionalSeen = true;
                }
            }
        }
    }
});

await test('publishes enabled slash commands through the global REST route', async () => {
    const applicationId = '123456789012345678';
    const calls: Array<{route: string; body: unknown}> = [];
    const rest: Pick<REST, 'put'> = {
        put: (route, options) => {
            calls.push({route, body: options?.body});
            return Promise.resolve([]);
        },
    };
    await registerSlashCommands(rest, applicationId, config);
    assert.deepEqual(calls, [{
        route: '/applications/123456789012345678/commands',
        body: buildSlashCommands(config),
    }]);
    await registerSlashCommands(rest, applicationId, {
        ...config, commands: {text: true, slash: false},
    });
    assert.equal(calls.length, 1);
    await assert.rejects(registerSlashCommands({
        put: () => Promise.reject(new Error('Example registration failure')),
    }, applicationId, config), /Example registration failure/u);
});

await test('shares season normalization and validation across command transports', () => {
    const values: Record<string, string> = {
        player: 'Example', platform: 'pc', mode: 'ranked', season: 'y9s1',
    };
    const interaction = {
        options: {
            getSubcommand: (): string => 'stats',
            getString: (name: string): string => {
                const value = values[name];
                assert.ok(value !== undefined);
                return value;
            },
        },
    };
    assert.deepEqual(parseSlashCommand(interaction, config),
        parseTextCommand('+r6 pc Example rank y9s1', config));
    values['season'] = 'Y9S5';
    assert.throws(() => parseSlashCommand(interaction, config), CommandError);
});

await test('dispatches seasons and groups zero values without missing data', async () => {
    const api = fakeApi({
        getOverview: () => Promise.resolve({...PROVENANCE, data: OVERVIEW}),
        getPlaylist: (platform, username, playlist, options) => {
            assert.equal(platform, 'ubi');
            assert.equal(username, 'Example');
            assert.equal(playlist, 'ranked');
            assert.deepEqual(options, {season: 33});
            return Promise.resolve({
                ...PROVENANCE,
                data: {
                    ...SEGMENT, season: {id: 33, name: null, shortName: null},
                },
            });
        },
    });
    const command = createQuery({
        platform: 'pc', username: 'Example', mode: 'rank',
        operator: null, season: 'y9s1',
    }, config);
    const reply = await executeCommand(command, config, api);
    assert.equal(reply.embeds[0]?.toJSON().description, 'Ranked • Y9S1');
    const fields = reply.embeds?.[0]?.toJSON().fields;
    assert.equal(fields?.find((field) => field.name === 'Win/Loss')?.value,
        'Wins **0**\nLosses **0**');
    assert.equal(fields?.find((field) => field.name === 'K/D')?.value,
        'Kills **0**\nDeaths **0**');
    assert.equal(fields?.find((field) => field.name === 'Head Shot')?.value,
        '**0%**\nHead Shots **0**');
    assert.equal(fields?.find((field) => field.name === 'RP')?.value, '**0**');
    assert.equal(fields?.find((field) => field.name === 'Time Played')?.value,
        '**0h 0m**');
    for (const name of ['Assists', 'Rounds', 'Round Wins']) {
        assert.equal(fields?.find((field) => field.name === name), undefined);
    }
    assert.doesNotMatch(JSON.stringify(fields), /N\/A/u);
});

await test('uses compact profile groups with available playtime and headshots', async () => {
    const overview: PlayerOverview = {
        ...OVERVIEW, clearanceLevel: 421, battlePassLevel: 12,
        overall: {
            ...SEGMENT,
            stats: {
                ...STATISTICS, wins: 3, losses: 1, winPercentage: 75,
                kills: 10, deaths: 5, kdRatio: 2, headshotPercentage: 50,
                headshots: 5, timePlayedSeconds: 3_660,
            },
        },
    };
    const api = fakeApi({
        getOverview: () => Promise.resolve({...PROVENANCE, data: overview}),
    });
    const reply = await executeCommand({
        kind: 'profile', platform: 'ubi', username: 'Example',
    }, config, api);
    const embed = reply.embeds[0]?.toJSON();
    assert.equal(embed?.title, 'Open Example profile');
    assert.equal(embed?.description, 'General • Lifetime');
    const fields = embed?.fields?.filter((field) => field.name !== '\u200B');
    assert.deepEqual(fields?.map((field) => field.name),
        ['Level', 'Time Played', 'Win/Loss', 'K/D', 'Head Shot']);
    assert.equal(fields?.find((field) => field.name === 'Time Played')?.value,
        '**1h 1m**');
    assert.equal(fields?.find((field) => field.name === 'Win/Loss')?.value,
        '**75%**\nWins **3**\nLosses **1**');
    assert.equal(fields?.find((field) => field.name === 'K/D')?.value,
        '**2**\nKills **10**\nDeaths **5**');
    assert.equal(fields?.find((field) => field.name === 'Head Shot')?.value,
        '**50%**\nHead Shots **5**');
});

await test('identifies current seasons and hides empty unranked rank placeholders', async () => {
    const api = fakeApi({
        getOverview: () => Promise.resolve({
            ...PROVENANCE, data: {...OVERVIEW, currentSeasonId: 40},
        }),
        getPlaylist: (platform, username, playlist, options) => {
            assert.equal(platform, 'ubi');
            assert.equal(username, 'Example');
            const unranked = playlist === 'unranked';
            return Promise.resolve({
                ...PROVENANCE,
                data: {
                    ...SEGMENT, name: unranked ? 'Unranked' : 'Ranked',
                    stats: {...STATISTICS, timePlayedSeconds: null},
                    rank: {
                        name: unranked ? 'NO RANK' : 'Example rank',
                        imageUrl: 'https://example.com/rank.png', tier: null,
                        points: 0, pointsType: 'mmr',
                    },
                    season: options?.season === 'all' ? null : SEGMENT.season,
                },
            });
        },
    });
    for (const season of ['current', 'all'] as const) {
        const reply = await executeCommand({
            kind: 'playlist', platform: 'ubi', username: 'Example',
            playlist: 'ranked', season,
        }, config, api);
        const embed = reply.embeds[0]?.toJSON();
        assert.equal(embed?.description, season === 'all' ? 'Ranked • Lifetime' :
            'Ranked • Y9S1 • Example season');
        assert.equal(embed?.fields?.find((field) => field.name === 'MMR')?.value,
            '**0**');
        assert.equal(embed?.fields?.find((field) =>
            field.name === 'Time Played'), undefined);
    }
    const reply = await executeCommand({
        kind: 'playlist', platform: 'ubi', username: 'Example',
        playlist: 'unranked', season: 'current',
    }, config, api);
    const embed = reply.embeds[0]?.toJSON();
    assert.equal(embed?.description, 'Unranked • Y9S1 • Example season');
    assert.equal(embed?.fields?.find((field) => field.name === 'Rank'), undefined);
    assert.equal(embed?.fields?.find((field) => field.name === 'MMR'), undefined);
    assert.equal(embed?.thumbnail?.url, OVERVIEW.player.avatarUrl);
});

await test('shows profile identity and reports absent operators and lifetime modes', async () => {
    const overview: PlayerOverview = {
        player: {
            platform: 'ubi', username: 'Example', userId: null,
            avatarUrl: null, profileUrl: PROVENANCE.sourceUrl,
        },
        clearanceLevel: 0, battlePassLevel: null, currentSeasonId: null,
        aliases: [], overall: null, playlists: [], seasons: [],
    };
    const api = fakeApi({
        getOverview: () => Promise.resolve({...PROVENANCE, data: overview}),
        getOperator: () => Promise.resolve({...PROVENANCE, data: null}),
        getPlaylist: () => Promise.resolve({...PROVENANCE, data: null}),
    });
    const profile = await executeCommand({
        kind: 'profile', platform: 'ubi', username: 'Example',
    }, config, api);
    const embed = profile.embeds[0]?.toJSON();
    assert.match(embed?.title ?? '', /Example/u);
    assert.equal(embed?.author?.name, 'Example');
    assert.equal(embed?.author?.icon_url, undefined);
    assert.equal(embed?.thumbnail, undefined);
    assert.equal(embed?.url,
        'https://r6.tracker.network/r6siege/profile/ubi/Example/overview');
    await assert.rejects(() => executeCommand({
        kind: 'operator', platform: 'ubi', username: 'Example', operator: 'ace',
    }, config, api), /No recorded statistics/u);
    await assert.rejects(() => executeCommand({
        kind: 'playlist', platform: 'ubi', username: 'Example',
        playlist: 'quick-match', season: 'all',
    }, config, api), /combined all/u);
});

await test('returns useful errors without revealing unexpected exception messages', () => {
    assert.equal(errorMessage(new Error('secret-token')),
        'Unable to complete the command. Please try again later.');
    assert.match(errorMessage(new R6StatsError('PLAYER_NOT_FOUND', 'internal')), /Player not found/u);
    assert.match(errorMessage(new R6StatsError('RATE_LIMITED', 'internal', {
        retryAfterMs: 2_100,
    })), /3s/u);
    for (const error of [
        new CommandError('Provide a player name.'),
        new R6StatsError('PLAYER_NOT_FOUND', 'internal'),
        new Error('secret-token'),
    ]) {
        const reply = createErrorReply(error, config);
        assert.equal('content' in reply, false);
        assert.equal(reply.embeds.length, 1);
        assert.equal(
            reply.embeds[0]?.toJSON().description, errorMessage(error),
        );
    }
});

await test('shows player avatars and overview links across statistics views', async () => {
    const overview: PlayerOverview = {
        ...OVERVIEW,
        player: {...OVERVIEW.player, platform: 'xbl', username: 'Player Name/#?'},
    };
    const operator: OperatorStats = {
        operator: 'ace', name: 'Ace', side: 'attacker',
        imageUrl: 'https://example.com/operator.png',
        stats: STATISTICS, metrics: {},
        coverage: {fromSeason: 'Y8S1', excludes: ['arcade', 'event']},
    };
    const api = fakeApi({
        getOverview: (platform, username) => {
            assert.equal(platform, 'xbl');
            assert.equal(username, 'Alias');
            return Promise.resolve({...PROVENANCE, data: overview});
        },
        getPlaylist: () => Promise.resolve({...PROVENANCE, data: SEGMENT}),
        getOperator: () => Promise.resolve({...PROVENANCE, data: operator}),
    });
    const commands: BotCommand[] = [
        {kind: 'profile', platform: 'xbl', username: 'Alias'},
        {
            kind: 'playlist', platform: 'xbl', username: 'Alias',
            playlist: 'ranked', season: 'current',
        },
        {kind: 'operator', platform: 'xbl', username: 'Alias', operator: 'ace'},
    ];
    const expectedUrl = 'https://r6.tracker.network/r6siege/profile/' +
        'xbl/Player%20Name%2F%23%3F/overview';
    for (const command of commands) {
        const reply = await executeCommand(command, config, api);
        assert.equal('content' in reply, false);
        assert.equal(reply.embeds.length, 1);
        const embed = reply.embeds[0]?.toJSON();
        assert.equal(embed?.author?.name, overview.player.username);
        assert.equal(embed?.author?.icon_url, overview.player.avatarUrl);
        assert.equal(embed?.author?.url, expectedUrl);
        assert.equal(embed?.url, expectedUrl);
        assert.doesNotMatch(JSON.stringify(embed?.fields), /N\/A/u);
        if (command.kind === 'operator') {
            assert.equal(embed?.description, 'Operator ACE • Since Y8S1');
            const rounds = embed?.fields?.find((field) =>
                field.name === 'Round W/L');
            assert.equal(rounds?.value, '**50%**\nWins **2**\nLosses **2**');
        }
        const thumbnail = command.kind === 'profile' ? 'avatar' :
            command.kind === 'operator' ? 'operator' : 'rank';
        assert.equal(embed?.thumbnail?.url,
            `https://example.com/${thumbnail}.png`);
    }
});

await test('uses embeds for help and ping without querying statistics', async () => {
    for (const kind of ['help', 'ping'] as const) {
        const reply = await executeCommand({kind}, config, fakeApi(), 42);
        assert.equal('content' in reply, false);
        assert.equal(reply.embeds.length, 1);
        assert.ok(reply.embeds[0]?.toJSON().title);
        if (kind === 'ping') {
            assert.match(reply.embeds[0]?.toJSON().description ?? '', /42ms/u);
        }
    }
});

await test('starts typing, refreshes it, and stops refreshing after cleanup', async (context) => {
    const logger = createConsoleLogger();
    logger.silent = true;
    context.after(() => closeLogger(logger));
    context.mock.timers.enable({apis: ['setInterval']});
    let calls = 0;
    const stopTyping = await startTyping({
        sendTyping: () => {
            calls++;
            return Promise.resolve();
        },
    }, logger);
    context.after(stopTyping);
    assert.equal(calls, 1);
    context.mock.timers.tick(8_000);
    assert.equal(calls, 2);
    stopTyping();
    context.mock.timers.tick(16_000);
    assert.equal(calls, 2);
});

await test('bounds concurrent queries and releases slots after failures', async () => {
    const gate = new RequestGate({
        ...config, requestCooldownMs: 0, maxConcurrentQueries: 1,
    });
    const deferred = Promise.withResolvers<number>();
    const first = gate.run('first', () => deferred.promise);
    await assert.rejects(() => gate.run('second', () => Promise.resolve(2)), /busy/u);
    deferred.resolve(1);
    assert.equal(await first, 1);
    await assert.rejects(() => gate.run('first', () =>
        Promise.reject(new Error('Example failure'))), /Example failure/u);
    assert.equal(await gate.run('second', () => Promise.resolve(2)), 2);
});
