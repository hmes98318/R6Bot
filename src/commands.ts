import type {Platform, Playlist} from 'r6s-stats-api';

import type {BotConfig} from './config.ts';
import {CommandError} from './errors.ts';

/** A normalized request used by both Discord command transports. */
export type StatsQuery =
    {kind: 'profile'; platform: Platform; username: string} |
    {
        kind: 'playlist';
        platform: Platform;
        username: string;
        playlist: Playlist;
        season: number | 'current' | 'all';
    } |
    {
        kind: 'operator';
        platform: Platform;
        username: string;
        operator: string;
    };

/** Locally answered commands and validated statistics queries. */
export type BotCommand = StatsQuery | {kind: 'help'} | {kind: 'ping'};

/** Raw query options supplied by either transport. */
export interface QueryInput {
    platform: string | null;
    username: string;
    mode: string | null;
    operator: string | null;
    season: string | null;
}

const PLATFORM_ALIASES: Record<string, Platform | undefined> = {
    pc: 'ubi',
    ubi: 'ubi',
    xbox: 'xbl',
    xbl: 'xbl',
    psn: 'psn',
};

const PLAYLIST_ALIASES: Record<string, Playlist | undefined> = {
    rank: 'ranked',
    ranked: 'ranked',
    casual: 'quick-match',
    'quick-match': 'quick-match',
    unrank: 'unranked',
    unranked: 'unranked',
    combined: 'unranked-and-quick-match',
    'unranked-and-quick-match': 'unranked-and-quick-match',
    'dual-front': 'dual-front',
    'siege-cup': 'siege-cup',
    arcade: 'arcade',
    event: 'event',
};

/** Normalize account-platform aliases accepted by text commands. */
export function parsePlatform(value: string): Platform | undefined {
    return Object.hasOwn(PLATFORM_ALIASES, value.toLowerCase()) ?
        PLATFORM_ALIASES[value.toLowerCase()] : undefined;
}

/** Normalize official season codes and convert them to API season IDs. */
function parseSeason(value: string | null): number | 'current' | 'all' {
    const normalized = (value ?? 'CURRENT').trim().toUpperCase();
    if (normalized === 'CURRENT') {
        return 'current';
    }
    if (normalized === 'ALL') {
        return 'all';
    }
    const match = /^Y([1-9]\d*)S([1-4])$/u.exec(normalized);
    if (match === null) {
        throw new CommandError('Season must be current, all, or a YxSx code, for example Y9S1.');
    }
    const season = (Number(match[1]) - 1) * 4 + Number(match[2]);
    if (!Number.isSafeInteger(season) || season > 10_000) {
        throw new CommandError('Season is outside the supported range.');
    }
    return season;
}

/** Validate and normalize a statistics request at the shared boundary. */
export function createQuery(input: QueryInput, config: BotConfig): StatsQuery {
    const platform = input.platform === null ? config.defaultPlatform :
        parsePlatform(input.platform);
    if (!platform) {
        throw new CommandError('Choose a platform: pc (ubi), xbox (xbl), or psn.');
    }
    const username = input.username.trim();
    if (!username || username.length > 64 || /[\p{Cc}]/u.test(username)) {
        throw new CommandError('Player names must contain 1–64 printable characters.');
    }
    const mode = input.mode?.toLowerCase() ?? 'profile';
    if (mode === 'profile') {
        if (input.season !== null || input.operator !== null) {
            throw new CommandError('Profile queries do not accept extra arguments.');
        }
        return {kind: 'profile', platform, username};
    }
    if (mode === 'operator') {
        const operator = input.operator?.trim().toLowerCase();
        if (!operator || operator.length > 64 || /[\p{Cc}]/u.test(operator) ||
            input.season !== null) {
            throw new CommandError('Provide one operator name, for example: operator ace.');
        }
        return {kind: 'operator', platform, username, operator};
    }
    if (mode === 'deathmatch') {
        throw new CommandError('Deathmatch is not supported by r6s-stats-api v2.');
    }
    const playlist = Object.hasOwn(PLAYLIST_ALIASES, mode) ?
        PLAYLIST_ALIASES[mode] : undefined;
    if (!playlist || input.operator !== null) {
        throw new CommandError('Unknown mode. Use the help command for available modes.');
    }
    return {
        kind: 'playlist', platform, username, playlist,
        season: parseSeason(input.season),
    };
}

/** Split whitespace-delimited arguments while preserving quoted names. */
function tokenize(input: string): string[] {
    const tokens = input.match(/"[^"]*"|'[^']*'|\S+/gu) ?? [];
    return tokens.map((token) => {
        if (token.startsWith('"') || token.startsWith("'")) {
            if (token.length < 2 || token.at(-1) !== token[0]) {
                throw new CommandError('Close the quote around the player name.');
            }
            return token.slice(1, -1);
        }
        return token;
    });
}

/** Recognize the command before parsing potentially invalid arguments. */
export function isTextCommand(content: string, config: BotConfig): boolean {
    const command = `${config.prefix}r6`;
    return content.slice(0, command.length).toLowerCase() ===
        command.toLowerCase() &&
        (content.length === command.length ||
            /\s/u.test(content.charAt(command.length)));
}

/** Parse +r6-style commands; unrelated Discord messages return null. */
export function parseTextCommand(
    content: string, config: BotConfig,
): BotCommand | null {
    if (!isTextCommand(content, config)) {
        return null;
    }
    const command = `${config.prefix}r6`;
    const tokens = tokenize(content.slice(command.length).trim());
    if (tokens.length === 0) {
        return {kind: 'help'};
    }
    const first = tokens[0]?.toLowerCase();
    if (first === 'help' || first === 'ping') {
        if (tokens.length !== 1) {
            throw new CommandError('Help and ping do not accept extra arguments.');
        }
        return {kind: first};
    }
    const explicitPlatform = first === undefined ? undefined :
        parsePlatform(first);
    const platform = explicitPlatform ?? null;
    if (explicitPlatform !== undefined) {
        tokens.shift();
    }
    const username = tokens.shift();
    if (username === undefined) {
        throw new CommandError('Provide a player name. Use quotes for names with spaces.');
    }
    const mode = tokens.shift()?.toLowerCase() ?? null;
    const argument = tokens.shift() ?? null;
    if (tokens.length > 0) {
        throw new CommandError('Too many arguments. Use the help command for examples.');
    }
    return createQuery({
        platform,
        username,
        mode,
        operator: mode === 'operator' ? argument : null,
        season: mode === 'operator' ? null : argument,
    }, config);
}
