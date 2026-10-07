# Development

## Runtime and architecture

R6Bot is one application developed on Node.js 24 LTS. Its package engine is `>=24.15.0`, matching the minimum required by `r6s-stats-api` 2.0.0 without imposing an upper version limit. The compiler uses ES2024, NodeNext modules, strict checking, native-compatible erasable syntax, and rewritten relative TypeScript imports. TypeScript 6.0.3 is the current stable version supported by the installed typescript-eslint parser; upgrade both together when parser support advances.

The root `config.js` exports `config` and is imported at runtime relative to the application module. It stays outside `dist/`, so a configuration edit only requires a process restart. Each setting has a formatted JSDoc comment explaining its meaning, units, and relevant constraints. Zod validates the object before startup. Only `BOT_TOKEN` belongs in `.env`; an existing process variable takes precedence over the file.

`src/commands.ts` normalizes both transports into a shared request. `src/stats.ts` dispatches requests to one dedicated `r6s-stats-api` client and builds Discord embeds. `src/slash-commands.ts` owns slash definitions, global registration, and option parsing. `src/bot.ts` handles gateway events, deferred interaction replies, and admission control. `src/index.ts` owns the bot process lifecycle. `src/run.ts` and `src/supervisor.ts` provide process recovery for native and container execution.

Startup subscribes to `clientReady` before calling Discord's `login()`. It waits for both login and readiness before registering slash commands or reading the ready client identity. Login can finish while Discord is still loading guild data. Startup failures close both clients and remove the readiness listener.

When `commands.slash` is enabled, startup registers the complete `/r6` definition globally through `client.rest.put(Routes.applicationCommands(client.application.id), ...)`. Reuse the authenticated REST manager and ready application ID; do not add token, client ID, guild ID, or registration scope settings. Registration runs once per startup rather than on reconnect events. Command definitions use `setIntegrationTypes(ApplicationIntegrationType.GuildInstall)` and `setContexts(InteractionContextType.Guild, InteractionContextType.BotDM)`. See the [discord.js REST example](https://discord.js.org/docs/packages/discord.js/14.27.0) and [Discord application command contexts](https://docs.discord.com/developers/interactions/application-commands#contexts).

The API client provides caching, request coalescing, an upstream cadence, timeouts, and bounded retries. The bot also limits simultaneous queries and rejects overlapping queries from the same user. Headless browser handling is enabled; SIGINT and SIGTERM close the client and Discord connection.

## Logging and error boundaries

`src/logger.ts` creates Winston loggers with UTC ISO timestamps and JSON Lines output. The bot writes to the console and a daily rotating `r6bot-%DATE%.log` file, configured by `logging` in `config.js`. Default limits are 10 MiB per file and 14 days of retention. A null directory enables console-only logging. The supervisor uses console-only logging so one bot process owns the file transport and its rotation metadata. Handle transport errors and retain console diagnostics when file writing fails. Flush and close transports during shutdown.

Log recognized commands before parsing or upstream work, including invalid commands. Record transport, command content, Discord user name and ID, guild ID or null for DMs, channel ID, and message/interaction ID. Use the same context for completion, duration, validation, API, and reply failures. Ignore bots, webhooks, unrelated messages, and unrelated interactions. Capture only selected error name, message, stack frames, code, and HTTP status; never serialize whole Discord interactions, HTTP request/response objects, or configuration. Redact BOT_TOKEN and credential fields in all formatted output.

Every gateway callback and typing refresh handles its asynchronous failures. `src/runtime-errors.ts` logs unhandled rejections and warnings, and requests shutdown for uncaught exceptions. Fatal shutdown closes Discord and the API client, flushes logs, and exits nonzero within 15 seconds. Startup failures also release any created resources. Follow [Node.js uncaught exception guidance](https://nodejs.org/docs/latest-v24.x/api/process.html#warning-using-uncaughtexception-correctly): recover a failed process with a separate supervisor.

The supervisor forks the bot entry point, inherits its output, and restarts unexpected exits with exponential delays from 1 to 30 seconds. Reset the delay after a process runs for at least one minute. SIGINT/SIGTERM cancel pending restarts, close the worker's IPC connection to request shutdown across platforms, and enforce an 18-second child termination deadline. Workers also stop when a terminated supervisor disconnects, including a Windows watch restart. The development watch process monitors the supervisor's imported bot modules; children do not inherit watch flags. Entry-point guards prevent importing the bot module from starting Discord sessions.

## Source data and command behavior

PC and Xbox text aliases map to `ubi` and `xbl`. PSN stays `psn`. Casual maps to Quick Match, Rank maps to Ranked, and Unrank maps to Unranked. Deathmatch is absent from v2 and returns an explicit unsupported message.

Playlist requests default to the current season. `all` requests recorded lifetime data, and official codes such as `Y9S1` select a season. Inputs are trimmed and normalized with `toUpperCase()`. The regex `^Y([1-9]\d*)S([1-4])$` requires a positive year without leading zeroes and a season from 1 through 4. Raw numeric IDs are not command inputs. `current` and `all` remain case-insensitive.

The API still requires numeric IDs, so the command boundary converts `YxSx` with `(year - 1) * 4 + season`; `Y9S1` becomes ID 33. Converted IDs must be safe integers within the installed API's supported range. Missing segments and missing operators return a clear no-data message. Missing statistic values and entirely empty fields are omitted; recorded zeroes remain visible.

Seasonal playlist descriptions always include the mode and `YxSx` code, followed by the source's season name when available. Resolve the displayed code from the returned segment's season ID, then the explicit request or profile's current season ID. Lifetime requests are labeled `Lifetime`; overall profiles and cumulative operator statistics never receive a misleading single-season label. Operator descriptions identify their coverage from `Y8S1` onward.

Separate lifetime Unranked and Quick Match segments may not exist. Use `combined all` to request the source's combined lifetime Unranked + Quick Match segment. The bot never substitutes a different season or splits combined totals.

Operator data covers Y8S1 onward and excludes Arcade and Event. Embed timestamps identify retrieval time, including cached retrieval time; they do not identify the last in-game update. Full type and data semantics are in the installed package's `docs/api.md`.

Every command response uses a Discord embed, including help, ping, validation errors, cooldowns, and API failures. Statistics embeds show the canonical player name and available avatar in the author header. The avatar is also the default thumbnail; a valid rank or operator image takes that thumbnail position. Missing or invalid avatar URLs are omitted.

Statistics layouts follow the compact grouping in the legacy bot screenshots. The title is `Open <player> profile`. Profiles show level and playtime above Win/Loss, K/D, and Head Shot groups. Playlists show available rank, RP/MMR, and playtime above Win/Loss, K/D, and Kills/Match (or available headshot statistics). Operators show Win/Loss, K/D, and playtime, followed by available headshot, kills-per-match, and Round W/L groups. Round counters stay separate from match counters. Omit battle pass, assists, standalone match/round totals, and unavailable legacy-only metrics. Unranked zero-point rank placeholders are omitted outside Ranked; meaningful source ranks and point units remain visible. Separate nonempty rows with one blank embed field, emphasize values in bold, and keep the source footer short with its retrieval timestamp.

Player author and title links are built as `https://r6.tracker.network/r6siege/profile/<platform>/<encoded-player-name>/overview`. Neither the API provenance URL nor an upstream profile URL controls navigation. Playlist and operator queries retrieve overview identity alongside their statistics through the same client, sharing its request coalescing and cache.

Recognized text commands send typing before execution and refresh it every eight seconds until their reply completes. The refresh timer is cleared on success or failure. Typing delivery failures are logged without cancelling command execution. Slash statistics commands continue to use deferred interaction replies.

## Local workflow

```sh
npm ci
npm run check
npm run dev
```

Use the latest Node.js 24 LTS release. `r6s-stats-api` automatically installs Chromium inside the resolved Playwright dependency directory during npm installation. Linux hosts also need Playwright system libraries; Docker packages them automatically. For a native Linux host, run `PLAYWRIGHT_BROWSERS_PATH=0 npx --no-install playwright install --with-deps chromium --no-shell` with the privileges required by the operating system package manager.

The test runner executes TypeScript directly. `tsconfig.build.json` emits only production source into `dist/`; configuration, unit tests, and manual scripts are excluded. CI runs `npm ci --ignore-scripts` followed by `npm run check`. It does not start a browser or contact external services.

## Manual scripts

| Command | Purpose | External requirements |
| --- | --- | --- |
| `npm run docker:build -- [image_name:tag]` | Build the selected image; default is `r6bot:latest` | Docker daemon and registry access |
| `npm run docker:build:test` | Check Dockerfile, build a temporary image, verify image metadata and runtime files, launch Chromium, and remove the temporary image | Docker daemon and registry access |
| `npm run api:smoke -- pc "waifu_-."` | Retrieve a public profile using the configured API options and close the client | Tracker access and installed Chromium |
| `npm run runtime:smoke` | Verify fatal restart, rejected-promise isolation, log flushing, and intentional shutdown with a synthetic worker | None; no bot token or network access |

The build command accepts at most one explicit tagged image reference, such as `my-r6bot:3.0.0`, `hmes98318/r6bot:3.0.0`, or `localhost:5000/team/r6bot:dev`. Validate repository components, an optional registry host and port, and a 1-128-character tag before invoking Docker. Follow the tagged-name grammar in [Distribution reference](https://github.com/distribution/reference/blob/main/regexp.go) and [Docker image reference documentation](https://docs.docker.com/reference/cli/docker/image/tag/). Use argument arrays without a shell and pass the selected reference unchanged to `docker build --tag`. The build smoke test uses a unique image reference and removes it after verification.

Each entry point supports `--help`. Scripts use kebab-case `.ts` names and native Node.js execution. They are never selected by `npm test` or CI. The Docker scripts follow the build and temporary-image smoke-test pattern in [Music-Disc's build script](https://github.com/hmes98318/Music-Disc/blob/main/scripts/docker-build.ts) and [build test](https://github.com/hmes98318/Music-Disc/blob/main/scripts/docker-build-test.ts).

The Docker smoke test requires no token and performs no Discord login or live statistics request. It verifies the production dependency set, root configuration, pinned Node.js version, writable log storage, rotating file output, and headless browser startup. Live API checks may fail due to upstream access challenges, missing players, or rate limits even when local checks pass.

## Container deployment

The Dockerfile pins `node:24.21.0-bookworm-slim` in a shared base stage so compilation and production use the same complete Node.js version. Dependency manifests are copied before source to preserve install-layer caching. The final stage installs only production modules plus managed Chromium and its Linux libraries, with `PLAYWRIGHT_BROWSERS_PATH=0` keeping the browser inside the Playwright package. It prepares `/bot/logs` for the `node` user and starts the supervisor. Compose enables an init process, injects `.env`, mounts root `config.js` read-only, and persists logs in the `bot-logs` named volume. Keep Compose indentation at two spaces and use concise native comments to explain browser shared memory and shutdown settings.

```sh
docker compose up -d --build
docker compose logs -f r6bot
docker compose down
```

Restart the service after editing configuration. Rebuild after changing source or dependencies. Enabled slash commands are registered globally during startup.

### Registry publishing

`.github/workflows/deploy.yml` runs when a Git tag matching `*` is pushed. It builds the root Dockerfile on `ubuntu-latest` and pushes `${{ secrets.DOCKER_REGISTRY }}/${{ secrets.DOCKER_IMAGE }}` with the Git tag and `latest` image tags. Docker metadata supplies the image tags and labels; Buildx caches build layers with the GitHub Actions cache backend. The workflow publishes an image; updating a running service remains a separate deployment step.

Configure these GitHub Actions repository secrets before pushing a release tag:

| Secret | Value |
| --- | --- |
| `DOCKER_REGISTRY` | Registry hostname and optional port, without a URL scheme; for example, `registry.example.com` |
| `DOCKER_IMAGE` | Image repository path without a registry or tag; for example, `team/r6bot` |
| `DOCKER_USERNAME` | Registry account with permission to push the image |
| `DOCKER_PASSWORD` | Registry password or access token |

The registry must be reachable from the GitHub-hosted runner. Registry credentials are used only by the login action and are not passed as Docker build arguments. The workflow grants only `contents: read` to `GITHUB_TOKEN` and does not run manual smoke scripts.

## Contributor instructions

`AGENTS.md` routes the mandatory standards under `docs/standards/`. The repository has no Claude Code adapter. Development documentation and Conventional Commit messages use en-US. Keep operational descriptions here or in the README; standards contain durable contributor rules.
