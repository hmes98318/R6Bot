import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

export const DEFAULT_IMAGE_REFERENCE = 'r6bot:latest';
const PROJECT_ROOT = fileURLToPath(new URL('../', import.meta.url));
const NAME_COMPONENT = '[a-z0-9]+(?:(?:[._]|__|-+)[a-z0-9]+)*';
const HOST_COMPONENT = '[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?';
const HOST = `(?:${HOST_COMPONENT}(?:\\.${HOST_COMPONENT})*|\\[[a-fA-F0-9:]+\\])`;
const IMAGE_REFERENCE_PATTERN = new RegExp(
    `^((?:${HOST}(?::[0-9]+)?/)?` +
    `${NAME_COMPONENT}(?:/${NAME_COMPONENT})*):[\\w][\\w.-]{0,127}$`, 'u',
);

/** Validate a tagged Docker reference before passing it to a subprocess. */
export function getImageReference(
    reference = DEFAULT_IMAGE_REFERENCE,
): string {
    const match = IMAGE_REFERENCE_PATTERN.exec(reference);
    const name = match?.[1];
    if (name === undefined || match?.[0] !== reference) {
        throw new Error('Use image_name:tag, for example my-r6bot:3.0.0.');
    }
    const slash = name.indexOf('/');
    const prefix = name.slice(0, slash);
    const repository = slash !== -1 &&
        (prefix === 'localhost' || /[.:A-Z]/u.test(prefix)) ?
        name.slice(slash + 1) : name;
    if (repository.length > 255) {
        throw new Error('Docker repository names must not exceed 255 characters.');
    }
    return reference;
}

/** Run Docker without a shell and optionally capture small inspect results. */
export function runDocker(
    args: string[], captureOutput = false,
): Promise<string> {
    return new Promise((resolve, reject) => {
        const child = spawn('docker', args, {
            cwd: PROJECT_ROOT,
            windowsHide: true,
            stdio: ['ignore', captureOutput ? 'pipe' : 'inherit', 'inherit'],
        });
        let output = '';
        child.stdout?.setEncoding('utf8');
        child.stdout?.on('data', (chunk: string) => {
            output += chunk;
        });
        child.once('error', reject);
        child.once('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Docker ${args[0] ?? 'command'} exited with ${code}.`));
            } else {
                resolve(output.trim());
            }
        });
    });
}

/** Build the root Dockerfile with the selected image name and tag. */
export async function buildImage(imageReference: string): Promise<void> {
    await runDocker(['build', '--tag', imageReference, '.']);
}

/** Convert unknown exceptions to a message for manual script diagnostics. */
export function scriptError(error: unknown): string {
    return error instanceof Error ? error.message : 'Unknown error';
}
