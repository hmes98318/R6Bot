import {config as loadEnvironment} from 'dotenv';
import {z} from 'zod';

const CONFIG_SCHEMA = z.strictObject({
    name: z.string().trim().min(1).max(64),
    prefix: z.string().regex(/^[^\s`]{1,8}$/u),
    color: z.string().regex(/^#[\da-f]{6}$/iu),
    defaultPlatform: z.enum(['ubi', 'psn', 'xbl']).nullable(),
    commands: z.strictObject({text: z.boolean(), slash: z.boolean()}),
    logging: z.strictObject({
        level: z.enum(['debug', 'info', 'warn', 'error']),
        directory: z.string().trim().min(1).max(512).nullable(),
        maxSizeMb: z.number().int().min(1).max(1_024),
        retentionDays: z.number().int().min(1).max(365),
    }),
    api: z.strictObject({
        timeoutMs: z.number().int().min(1).max(120_000),
        cacheTtlMs: z.number().int().min(0).max(3_600_000),
        minRequestIntervalMs: z.number().int().min(0).max(60_000),
        retries: z.union([z.literal(0), z.literal(1), z.literal(2)]),
    }),
    requestCooldownMs: z.number().int().min(0).max(60_000),
    maxConcurrentQueries: z.number().int().min(1).max(16),
}).refine((value) => value.commands.text || value.commands.slash, {
    message: 'Enable at least one command transport.',
    path: ['commands'],
});

/** Validated public settings shared by the bot and developer scripts. */
export type BotConfig = z.infer<typeof CONFIG_SCHEMA>;

/** Validate external configuration without exposing its values in errors. */
export function parseConfig(input: unknown): BotConfig {
    const result = CONFIG_SCHEMA.safeParse(input);
    if (!result.success) {
        const issues = result.error.issues.map((issue) =>
            `${issue.path.join('.') || 'config'}: ${issue.message}`);
        throw new Error(`Invalid config.js: ${issues.join('; ')}`);
    }
    return result.data;
}

/** Import root config.js from either src/ or dist/ without copying it. */
export async function loadConfig(): Promise<BotConfig> {
    const module: unknown = await import(
        new URL('../config.js', import.meta.url).href,
    );
    if (typeof module !== 'object' || module === null ||
        !('config' in module)) {
        throw new Error('config.js must export a named config object.');
    }
    return parseConfig(module.config);
}

/** Read the required token after dotenv has populated the environment. */
export function readBotToken(environment: NodeJS.ProcessEnv): string {
    const token = environment['BOT_TOKEN']?.trim();
    if (!token || token === 'your_token') {
        throw new Error('Set BOT_TOKEN in .env or the process environment.');
    }
    return token;
}

/** Load only the token from .env, preserving existing process variables. */
export function loadBotToken(): string {
    loadEnvironment({quiet: true});
    return readBotToken(process.env);
}
