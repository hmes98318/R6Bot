import type {BotConfig} from './config.ts';
import {CommandError} from './errors.ts';

/** Bound simultaneous queries and reject repeated requests by one user. */
export class RequestGate {
    private readonly activeUsers = new Set<string>();
    private readonly nextAllowed = new Map<string, number>();
    private readonly cooldownMs: number;
    private readonly maximum: number;

    constructor(config: BotConfig) {
        this.cooldownMs = config.requestCooldownMs;
        this.maximum = config.maxConcurrentQueries;
    }

    /** Run one query while guaranteeing admission state is released. */
    async run<T>(userId: string, work: () => Promise<T>): Promise<T> {
        const now = Date.now();
        for (const [id, until] of this.nextAllowed) {
            if (until <= now) {
                this.nextAllowed.delete(id);
            }
        }
        if (this.activeUsers.has(userId)) {
            throw new CommandError('Your previous statistics query is still running.');
        }
        const until = this.nextAllowed.get(userId);
        if (until !== undefined) {
            const seconds = Math.ceil((until - now) / 1_000);
            throw new CommandError(`Please wait ${seconds}s before another query.`);
        }
        if (this.activeUsers.size >= this.maximum) {
            throw new CommandError('The bot is busy. Please try again shortly.');
        }
        this.activeUsers.add(userId);
        this.nextAllowed.set(userId, now + this.cooldownMs);
        try {
            return await work();
        } finally {
            this.activeUsers.delete(userId);
        }
    }
}
