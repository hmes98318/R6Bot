/**
 * Public application settings. Store the Discord token in .env.
 * @type {import('./src/config.ts').BotConfig}
 */
export const config = {
    /** Bot label shown in embed footers and startup logs. */
    name: 'R6Bot',

    /** Text command prefix: 1-8 characters without whitespace or backticks. */
    prefix: '+',

    /** Embed accent color as a six-digit hexadecimal value. */
    color: '#ff00ee',

    /**
     * Default platform: 'ubi' (PC), 'psn' (PlayStation), or 'xbl' (Xbox).
     * Set null to require a platform in every statistics command.
     */
    defaultPlatform: 'ubi',

    /** Enable command transports. At least one must remain enabled. */
    commands: {
        /** Requires Message Content Intent in the Discord Developer Portal. */
        text: true,

        /** Enable /r6 commands and global registration during startup. */
        slash: true,
    },

    /** Console and rotating JSON logs use UTC timestamps. */
    logging: {
        /** Minimum severity: 'debug', 'info', 'warn', or 'error'. */
        level: 'info',

        /** Log directory; set null for console output only. */
        directory: 'logs',

        /** Rotate a file after 1-1,024 MiB. */
        maxSizeMb: 10,

        /** Keep rotated log files for 1-365 days. */
        retentionDays: 14,
    },

    /** Options for the shared Tracker client. Time values are milliseconds. */
    api: {
        /** Timeout per upstream request: 1-120,000 ms. */
        timeoutMs: 20_000,

        /**
         * Successful response cache lifetime: 0-3,600,000 ms.
         * Set 0 to disable caching.
         */
        cacheTtlMs: 60_000,

        /** Minimum interval between upstream requests: 0-60,000 ms. */
        minRequestIntervalMs: 1_000,

        /** Additional retry attempts for transient failures: 0, 1, or 2. */
        retries: 1,
    },

    /** Per-user statistics command cooldown: 0-60,000 ms; 0 disables it. */
    requestCooldownMs: 5_000,

    /** Maximum simultaneous statistics queries across all users: 1-16. */
    maxConcurrentQueries: 4,
};
