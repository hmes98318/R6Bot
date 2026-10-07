import {
    buildImage, DEFAULT_IMAGE_REFERENCE, getImageReference, scriptError,
} from './docker.ts';

/** Build a developer-selected image without starting the bot. */
async function main(): Promise<void> {
    const args = process.argv.slice(2);
    if (args.length === 1 && (args[0] === '--help' || args[0] === '-h')) {
        console.log('Usage: npm run docker:build -- [image_name:tag]');
        console.log(`Default image: ${DEFAULT_IMAGE_REFERENCE}`);
        console.log('Example: npm run docker:build -- my-r6bot:3.0.0');
        return;
    }
    if (args.length > 1) {
        throw new Error('Expected at most one Docker image reference.');
    }
    const imageReference = getImageReference(args[0]);
    await buildImage(imageReference);
    console.log(`Built ${imageReference}.`);
}

try {
    await main();
} catch (error: unknown) {
    console.error(`Docker build failed: ${scriptError(error)}`);
    process.exitCode = 1;
}
