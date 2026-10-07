import {R6StatsError} from 'r6s-stats-api';

/** A safe message describing invalid input or unavailable command data. */
export class CommandError extends Error {}

/** Convert errors to useful Discord messages without revealing exceptions. */
export function errorMessage(error: unknown): string {
    if (error instanceof CommandError) {
        return error.message;
    }
    if (error instanceof R6StatsError) {
        switch (error.code) {
            case 'INVALID_ARGUMENT':
                return 'Check the platform, player name, and season.';
            case 'PLAYER_NOT_FOUND':
                return 'Player not found. Check the name and platform.';
            case 'ACCESS_DENIED':
                return 'Tracker denied access. Please try again later.';
            case 'RATE_LIMITED': {
                const seconds = Math.ceil(
                    (error.retryAfterMs ?? 5_000) / 1_000,
                );
                return `Tracker is rate limited. Try again in ${seconds}s.`;
            }
            case 'TIMEOUT':
                return 'The statistics request timed out. Please try again.';
            case 'BROWSER_UNAVAILABLE':
                return 'The statistics browser is unavailable. ' +
                    'Ask the bot administrator to reinstall dependencies.';
            case 'CLIENT_CLOSED':
                return 'The bot is shutting down. Please try again later.';
            default:
                return 'Statistics are temporarily unavailable. ' +
                    'Please try again later.';
        }
    }
    return 'Unable to complete the command. Please try again later.';
}
