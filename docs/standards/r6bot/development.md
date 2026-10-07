# Application Development

- Develop application code and developer scripts with Node.js 24 LTS and TypeScript. Set the package engine to `>=24.15.0` and respect installed dependency requirements. Pin container Node.js images to a complete version number.
- Keep text and slash commands on the same validated request and statistics execution path.
- Use the installed `r6s-stats-api` public types and dedicated client API. Reuse the client and release its browser resources during shutdown.
- Keep the bot token in `.env` or the process environment. Keep all other application settings in root `config.js`, loaded at runtime without rebuilding.
- Prefer stable, popular packages. Keep the compiler and ESLint parser on mutually supported stable versions, and commit the npm lockfile.
- Use NodeNext ESM, strict type checking, explicit file extensions, and erasable TypeScript syntax. Keep manual scripts outside production build output.
- Validate configuration before opening Discord connections. Do not silently repair invalid configuration.
- Support both native Node.js execution and Docker Compose. Package the browser and its Linux dependencies in the runtime image, run as a non-root user, and exclude credentials from the build context.
- Read and update `docs/development.md` and the README when changing public command behavior, configuration, installation, or deployment.
- Run `npm run check` for cross-cutting changes. Run manual deployment checks when modifying container packaging.
