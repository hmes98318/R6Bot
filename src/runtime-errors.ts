import type {EventEmitter} from 'node:events';

import type {Logger} from 'winston';

import {logError} from './logger.ts';

/** Keep rejected work isolated and restart after unsafe process exceptions. */
export function installRuntimeErrorHandlers(
    logger: Logger, onFatal: () => void, events: EventEmitter = process,
): () => void {
    /** Record rejected promises that escaped their local error boundary. */
    function handleRejection(reason: unknown): void {
        logError(logger, 'Unhandled promise rejection', reason, {
            event: 'unhandled_rejection',
        });
    }

    /** A process exception requires cleanup and a fresh worker. */
    function handleException(error: Error, origin: string): void {
        logError(logger, 'Uncaught exception; restarting bot', error, {
            event: 'uncaught_exception', origin,
        });
        onFatal();
    }

    /** Preserve runtime warnings alongside command diagnostics. */
    function handleWarning(warning: Error): void {
        logger.warn('Process warning', {
            event: 'process_warning', name: warning.name,
            warning: warning.message,
        });
    }

    events.on('unhandledRejection', handleRejection);
    events.on('uncaughtException', handleException);
    events.on('warning', handleWarning);
    return (): void => {
        events.off('unhandledRejection', handleRejection);
        events.off('uncaughtException', handleException);
        events.off('warning', handleWarning);
    };
}
