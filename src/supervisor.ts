import {fork} from 'node:child_process';
import type {ChildProcess} from 'node:child_process';
import type {EventEmitter} from 'node:events';

import type {Logger} from 'winston';

import {logError} from './logger.ts';

/** Run one bot worker at a time and restart it after unexpected termination. */
export function superviseWorker(
    entry: URL, logger: Logger, signals: EventEmitter = process,
): Promise<void> {
    return new Promise((resolve) => {
        let worker: ChildProcess | undefined;
        let restartTimer: NodeJS.Timeout | undefined;
        let stopTimer: NodeJS.Timeout | undefined;
        let stopping = false;
        let restartDelayMs = 1_000;

        /** Remove supervisor resources after an intentional stop. */
        function finish(): void {
            clearTimeout(restartTimer);
            clearTimeout(stopTimer);
            signals.off('SIGINT', stop);
            signals.off('SIGTERM', stop);
            resolve();
        }

        /** Back off repeated startup failures before the next attempt. */
        function restart(): void {
            logger.warn('Restarting bot worker', {
                event: 'worker_restart', delayMs: restartDelayMs,
            });
            restartTimer = setTimeout(start, restartDelayMs);
            restartDelayMs = Math.min(restartDelayMs * 2, 30_000);
        }

        /** Launch an independent worker without inheriting the watch flag. */
        function start(): void {
            restartTimer = undefined;
            const started = Date.now();
            try {
                worker = fork(entry, [], {
                    stdio: 'inherit', execArgv: ['--enable-source-maps'],
                });
            } catch (error: unknown) {
                logError(logger, 'Bot worker could not start', error);
                restart();
                return;
            }
            logger.info('Bot worker started', {
                event: 'worker_started', workerPid: worker.pid ?? null,
            });
            worker.once('error', (error: Error) =>
                logError(logger, 'Bot worker process error', error));
            let ended = false;

            /** Observe termination and failed spawns after IPC shutdown. */
            function handleExit(
                code: number | null, signal: NodeJS.Signals | null,
            ): void {
                if (ended) {
                    return;
                }
                ended = true;
                worker = undefined;
                if (stopping) {
                    logger.info('Bot worker stopped', {
                        event: 'worker_stopped', code, signal,
                    });
                    finish();
                    return;
                }
                const runtimeMs = Date.now() - started;
                logger.error('Bot worker exited unexpectedly', {
                    event: 'worker_exit', code, signal, runtimeMs,
                });
                if (runtimeMs >= 60_000) {
                    restartDelayMs = 1_000;
                }
                restart();
            }

            worker.once('exit', handleExit);
            worker.once('close', handleExit);
        }

        /** Request portable shutdown and bound cleanup without restarting. */
        function stop(): void {
            if (stopping) {
                return;
            }
            stopping = true;
            clearTimeout(restartTimer);
            logger.info('Stopping bot supervisor', {event: 'supervisor_stopping'});
            if (worker === undefined) {
                finish();
                return;
            }
            if (worker.connected) {
                worker.disconnect();
            } else {
                worker.kill('SIGTERM');
            }
            stopTimer = setTimeout(() => worker?.kill('SIGKILL'), 18_000);
            stopTimer.unref();
        }

        signals.on('SIGINT', stop);
        signals.on('SIGTERM', stop);
        start();
    });
}
