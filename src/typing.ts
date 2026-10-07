import type {SendableChannels} from 'discord.js';
import type {Logger} from 'winston';

import {logError} from './logger.ts';

/** Refresh typing during text command work and return its cleanup callback. */
export async function startTyping(
    channel: Pick<SendableChannels, 'sendTyping'>, logger: Logger,
): Promise<() => void> {
    /** A typing failure must not prevent delivery of the command response. */
    async function refresh(): Promise<void> {
        try {
            await channel.sendTyping();
        } catch (error: unknown) {
            logError(logger, 'Discord typing failed', error, {
                event: 'typing_failed',
            });
        }
    }

    await refresh();
    const timer = setInterval(() => {
        void refresh();
    }, 8_000);
    timer.unref();
    return () => clearInterval(timer);
}
