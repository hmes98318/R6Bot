import {EmbedBuilder, escapeMarkdown} from 'discord.js';
import type {APIEmbedField} from 'discord.js';
import type {
    Player, R6StatsClient, Season, Statistics, TrackerResult,
} from 'r6s-stats-api';

import type {BotCommand, StatsQuery} from './commands.ts';
import type {BotConfig} from './config.ts';
import {CommandError, errorMessage} from './errors.ts';

/** The small API boundary required by the bot, also usable by test doubles. */
export type StatsApi = Pick<
    R6StatsClient, 'getOverview' | 'getPlaylist' | 'getOperator'
>;

/** A reply supported by messages, initial interactions, and deferred edits. */
export interface CommandReply {
    embeds: EmbedBuilder[];
}

const NUMBER_FORMAT = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
});

/** Emphasize recorded numbers while leaving missing values out of the field. */
function formatNumber(value: number | null): string | null {
    return value === null ? null : `**${NUMBER_FORMAT.format(value)}**`;
}

/** Percentages from the API already use the 0–100 scale. */
function formatPercent(value: number | null): string | null {
    return value === null ? null : `**${NUMBER_FORMAT.format(value)}%**`;
}

/** Display the API's seconds as whole hours and minutes. */
function formatDuration(value: number | null): string | null {
    if (value === null) {
        return null;
    }
    const hours = Math.floor(value / 3_600);
    const minutes = Math.floor((value % 3_600) / 60);
    return `**${NUMBER_FORMAT.format(hours)}h ${minutes}m**`;
}

/** Put match or combat counters below their percentage or ratio. */
function labeledNumber(label: string, value: number | null): string | null {
    const formatted = formatNumber(value);
    return formatted === null ? null : `${label} ${formatted}`;
}

/** Omit unavailable lines and fields instead of creating N/A placeholders. */
function createField(
    name: string, ...lines: Array<string | null>
): APIEmbedField | null {
    const available = lines.filter((line) => line !== null);
    return available.length === 0 ? null : {
        name, value: available.join('\n').slice(0, 1_024), inline: true,
    };
}

/** Keep nonempty summary rows separate from the three-column combat groups. */
function addRow(
    embed: EmbedBuilder, ...fields: Array<APIEmbedField | null>
): void {
    const available = fields.filter((field) => field !== null);
    if (available.length === 0) {
        return;
    }
    if ((embed.data.fields?.length ?? 0) > 0) {
        embed.addFields({name: '\u200B', value: '\u200B', inline: false});
    }
    embed.addFields(available);
}

/** Group match wins and losses without using round counters as substitutes. */
function winLossField(stats: Statistics): APIEmbedField | null {
    return createField('Win/Loss', formatPercent(stats.winPercentage),
        labeledNumber('Wins', stats.wins), labeledNumber('Losses', stats.losses));
}

/** Group combat counts beneath the source-provided K/D ratio. */
function kdField(stats: Statistics): APIEmbedField | null {
    return createField('K/D', formatNumber(stats.kdRatio),
        labeledNumber('Kills', stats.kills), labeledNumber('Deaths', stats.deaths));
}

/** Show the available headshot percentage and total together. */
function headshotField(stats: Statistics): APIEmbedField | null {
    return createField('Head Shot', formatPercent(stats.headshotPercentage),
        labeledNumber('Head Shots', stats.headshots));
}

/** Show the actual season code alongside its available operation name. */
function seasonPeriod(
    selected: number | 'current' | 'all', season: Season | null,
    currentSeasonId: number | null,
): string {
    if (selected === 'all') {
        return 'Lifetime';
    }
    const id = season?.id ??
        (typeof selected === 'number' ? selected : currentSeasonId);
    if (id === null || !Number.isSafeInteger(id) || id <= 0) {
        return season?.name ?? 'Current season';
    }
    const code = `Y${Math.ceil(id / 4)}S${(id - 1) % 4 + 1}`;
    return season?.name ? `${code} • ${season.name}` : code;
}

/** Accept only web URLs before sending upstream links to Discord. */
function safeUrl(value: string | null): string | null {
    if (value === null) {
        return null;
    }
    try {
        const url = new URL(value);
        return url.protocol === 'https:' || url.protocol === 'http:' ?
            url.href : null;
    } catch {
        return null;
    }
}

/** Apply the configured branding to every command response. */
function createEmbed(title: string, config: BotConfig): EmbedBuilder {
    return new EmbedBuilder()
        .setColor(Number.parseInt(config.color.slice(1), 16))
        .setTitle(escapeMarkdown(title).slice(0, 256))
        .setFooter({text: config.name});
}

/** Link player identity to the public overview and show available avatars. */
function createStatsEmbed(
    result: TrackerResult<unknown>, player: Player, config: BotConfig,
): EmbedBuilder {
    const url = 'https://r6.tracker.network/r6siege/profile/' +
        `${player.platform}/${encodeURIComponent(player.username)}/overview`;
    const author = {name: player.username.slice(0, 256), url};
    const avatarUrl = safeUrl(player.avatarUrl);
    const embed = createEmbed(`Open ${player.username} profile`, config)
        .setURL(url)
        .setAuthor(
            avatarUrl === null ? author : {...author, iconURL: avatarUrl},
        )
        .setFooter({text: config.name});
    addThumbnail(embed, avatarUrl);
    const timestamp = new Date(result.fetchedAt);
    if (!Number.isNaN(timestamp.getTime())) {
        embed.setTimestamp(timestamp);
    }
    return embed;
}

/** Add a validated optional avatar or operator/rank thumbnail. */
function addThumbnail(embed: EmbedBuilder, value: string | null): void {
    const url = safeUrl(value);
    if (url !== null) {
        embed.setThumbnail(url);
    }
}

/** Fetch and render the selected statistics without inventing absent data. */
async function queryStats(
    query: StatsQuery, config: BotConfig, api: StatsApi,
): Promise<EmbedBuilder> {
    if (query.kind === 'profile') {
        const result = await api.getOverview(query.platform, query.username);
        const data = result.data;
        const embed = createStatsEmbed(
            result, data.player, config,
        ).setDescription(data.overall === null ?
            'General • Lifetime\nNo recorded lifetime overall statistics.' :
            'General • Lifetime');
        addRow(embed,
            createField('Level', formatNumber(data.clearanceLevel)),
            createField('Time Played',
                formatDuration(data.overall?.stats.timePlayedSeconds ?? null)),
        );
        if (data.overall !== null) {
            const stats = data.overall.stats;
            addRow(embed, winLossField(stats), kdField(stats),
                headshotField(stats));
        }
        return embed;
    }
    if (query.kind === 'operator') {
        const [overview, result] = await Promise.all([
            api.getOverview(query.platform, query.username),
            api.getOperator(
                query.platform, query.username, query.operator,
            ),
        ]);
        if (result.data === null) {
            throw new CommandError('No recorded statistics for that operator. ' +
                'Check the operator name; data covers Y8S1 onward.');
        }
        const data = result.data;
        const player = overview.data.player;
        const embed = createStatsEmbed(
            result, player, config,
        ).setDescription(escapeMarkdown(
            `Operator ${(data.name ?? data.operator).toUpperCase()} • Since Y8S1`,
        ).slice(0, 4_096));
        addThumbnail(embed, data.imageUrl);
        const stats = data.stats;
        addRow(embed, winLossField(stats), kdField(stats),
            createField('Time Played', formatDuration(stats.timePlayedSeconds)));
        addRow(embed, headshotField(stats),
            createField('Kills/Match', formatNumber(stats.killsPerMatch)),
            createField('Round W/L', formatPercent(stats.roundWinPercentage),
                labeledNumber('Wins', stats.roundsWon),
                labeledNumber('Losses', stats.roundsLost)),
        );
        return embed;
    }
    const [overview, result] = await Promise.all([
        api.getOverview(query.platform, query.username),
        api.getPlaylist(
            query.platform, query.username, query.playlist,
            {season: query.season},
        ),
    ]);
    if (result.data === null) {
        const combinedHint = query.season === 'all' &&
            (query.playlist === 'unranked' || query.playlist === 'quick-match') ?
            ' Use combined all for combined lifetime Unranked + Quick Match.' : '';
        throw new CommandError('No recorded statistics for this mode and season.' +
            combinedHint);
    }
    const data = result.data;
    const period = seasonPeriod(
        query.season, data.season, overview.data.currentSeasonId,
    );
    const player = overview.data.player;
    const embed = createStatsEmbed(
        result, player, config,
    ).setDescription(escapeMarkdown(
        `${data.name ?? query.playlist} • ${period}`,
    ).slice(0, 4_096));
    const rankFields: Array<APIEmbedField | null> = [];
    const rank = data.rank;
    const rankName = rank?.name?.trim() || null;
    if (rank !== null && (query.playlist === 'ranked' ||
        (rank.points ?? 0) > 0 ||
        (rankName !== null && !/^(?:NO RANK|UNRANKED)$/iu.test(rankName)))) {
        rankFields.push(
            createField('Rank', rankName === null ? null :
                `**${escapeMarkdown(rankName).slice(0, 1_020)}**`),
            createField(rank.pointsType?.toUpperCase() ?? 'Rank Points',
                formatNumber(rank.points)),
        );
        addThumbnail(embed, rank.imageUrl);
    }
    const stats = data.stats;
    addRow(embed, ...rankFields,
        createField('Time Played', formatDuration(stats.timePlayedSeconds)));
    addRow(embed, winLossField(stats), kdField(stats),
        createField('Kills/Match', formatNumber(stats.killsPerMatch)) ??
            headshotField(stats));
    return embed;
}

/** Build usage examples from enabled transports and the configured prefix. */
function helpEmbed(config: BotConfig): EmbedBuilder {
    const prefix = `${config.prefix}r6`;
    const embed = createEmbed(`${config.name} Help`, config)
        .setDescription('Rainbow Six Siege player statistics.');
    if (config.commands.text) {
        embed.addFields({
            name: 'Text commands',
            value: [
                '```',
                `${prefix} [pc|xbox|psn] <player> [mode [season]]`,
                `${prefix} pc "Player Name" rank current`,
                `${prefix} player rank Y9S1`,
                `${prefix} player operator ace`,
                `${prefix} player combined all`,
                `${prefix} help`,
                `${prefix} ping`,
                '```',
            ].join('\n'),
        });
    }
    if (config.commands.slash) {
        embed.addFields({
            name: 'Slash commands',
            value: '`/r6 profile`, `/r6 stats`, `/r6 operator`, ' +
                '`/r6 help`, `/r6 ping`',
        });
    }
    embed.addFields(
        {
            name: 'Modes and seasons',
            value: '`rank`, `casual`, `unrank`, `combined`, `dual-front`, ' +
                '`siege-cup`, `arcade`, `event`. Season: `current`, `all`, ' +
                'or `YxSx` (for example `Y9S1`). Deathmatch is unavailable in API v2.',
        },
        {
            name: 'Platform',
            value: config.defaultPlatform === null ?
                'A platform is required for every query.' :
                `Default: ${config.defaultPlatform}. ` +
                    'Text aliases pc/ubi, xbox/xbl, and psn are accepted.',
        },
    );
    return embed;
}

/** Render controlled error messages consistently for either transport. */
export function createErrorReply(
    error: unknown, config: BotConfig,
): CommandReply {
    const embed = createEmbed('Unable to complete command', config)
        .setDescription(errorMessage(error).slice(0, 4_096));
    return {embeds: [embed]};
}

/** Execute a normalized command for either Discord transport. */
export async function executeCommand(
    command: BotCommand, config: BotConfig, api: StatsApi, latencyMs = 0,
): Promise<CommandReply> {
    if (command.kind === 'help') {
        return {embeds: [helpEmbed(config)]};
    }
    if (command.kind === 'ping') {
        const latency = latencyMs < 0 ? 'N/A' : `${Math.round(latencyMs)}ms`;
        const embed = createEmbed('Pong!', config)
            .setDescription(`Gateway latency: ${latency}.`);
        return {embeds: [embed]};
    }
    return {embeds: [await queryStats(command, config, api)]};
}
