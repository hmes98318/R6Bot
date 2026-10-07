# R6Bot

A Discord bot for Rainbow Six Siege player statistics, rebuilt with Node.js 24 LTS, TypeScript, discord.js, and r6s-stats-api 2.0.0. Both text commands and slash commands use the same query logic.

## Requirements

- Node.js 24.15.0 or newer and npm; Node.js 24 LTS is recommended.
- A Discord application with a bot token.
- Docker and Docker Compose for container deployment.

## Install and configure

```sh
git clone https://github.com/hmes98318/R6Bot.git
cd R6Bot
npm ci
```

The API uses HTTP first and a managed headless Chromium browser when an access challenge requires it. `r6s-stats-api` installs Chromium automatically during npm installation. For native Linux browser system dependencies, see [development documentation](docs/development.md).

Create `.env` from [.env.example](.env.example) and replace the placeholder:

```env
# Discord Bot Token
BOT_TOKEN = "your_token"
```

An existing process environment variable overrides `.env`. The previous `TOKEN` variable is retired; use `BOT_TOKEN`. Keep the token private. All other settings are in [config.js](config.js); restart the process after editing that file.

| Setting | Default | Purpose |
| --- | --- | --- |
| `name` | `R6Bot` | Bot label in replies and logs |
| `prefix` | `+` | Text command prefix, 1–8 non-whitespace characters |
| `color` | `#ff00ee` | Six-digit embed color |
| `defaultPlatform` | `ubi` | Default account platform; `null` makes it required |
| `commands.text` | `true` | Enable text commands |
| `commands.slash` | `true` | Enable slash commands and global registration on startup |
| `logging.level` | `info` | Minimum log level: debug, info, warn, or error |
| `logging.directory` | `logs` | Log directory relative to the working directory; null disables files |
| `logging.maxSizeMb` | `10` | Rotate files after this many MiB |
| `logging.retentionDays` | `14` | Retain rotated logs for this many days |
| `api.timeoutMs` | `20000` | Timeout for individual upstream requests |
| `api.cacheTtlMs` | `60000` | Successful response cache lifetime |
| `api.minRequestIntervalMs` | `1000` | Minimum cadence between upstream requests |
| `api.retries` | `1` | Additional transient retries, from 0 to 2 |
| `requestCooldownMs` | `5000` | Per-user statistics query cooldown |
| `maxConcurrentQueries` | `4` | Maximum simultaneous statistics queries |

Enable at least one command transport. Slash commands are registered globally and work across installed servers and in direct messages with the bot. The formatted JSDoc comments in `config.js` explain each option, its units, and supported values.

In the [Discord Developer Portal](https://discord.com/developers/applications), enable **Message Content Intent** when text commands are enabled. Invite the application with the `bot` and `applications.commands` scopes, and grant **View Channels**, **Send Messages**, and **Embed Links** in channels where it will respond. Grant **Send Messages in Threads** when using threads. Administrator permissions are unnecessary. Slash-only configuration does not request Message Content Intent.

## Run with Node.js

```sh
npm run start
```

For development, `npm run dev` executes TypeScript directly and restarts after source or configuration changes. Both start scripts run a supervisor that restarts the bot process after an unexpected exit, with a bounded restart delay. Text commands work in servers and direct messages. Enabled slash commands are registered globally once after startup reaches a ready Discord session.

All command replies use embedded messages, including help, ping, and errors. Player statistics display the available player avatar beside the name. Player names and titles always link to that player's overview on `r6.tracker.network`. Text commands display typing while the bot processes the request.

## Text commands

```text
+r6 [pc|ubi|xbox|xbl|psn] <player>
+r6 [platform] <player> <mode> [current|all|YxSx]
+r6 [platform] <player> operator <operator-name>
+r6 help
+r6 ping
```

Omit the platform when a default is configured. Use double or single quotes around player names containing spaces.

```text
+r6 pc waifu_-.
+r6 xbox "Player Name" rank
+r6 waifu_-. casual Y9S1
+r6 waifu_-. combined all
+r6 waifu_-. operator ace
```

| Mode | API playlist |
| --- | --- |
| `rank`, `ranked` | Ranked |
| `casual`, `quick-match` | Quick Match |
| `unrank`, `unranked` | Unranked |
| `combined`, `unranked-and-quick-match` | Combined Unranked + Quick Match |
| `dual-front` | Dual Front |
| `siege-cup` | Siege Cup |
| `arcade` | Arcade |
| `event` | Event |

PC maps to the API platform `ubi`; Xbox maps to `xbl`; PlayStation uses `psn`. Modes and platform aliases are case-insensitive. Deathmatch is unavailable in API v2, and its old text command returns an explicit explanation.

Playlist queries default to the current season. `all` selects recorded lifetime totals; use an official season code such as `Y9S1` for a specific season. Season inputs are automatically converted to uppercase, so `y9s1` also works. Codes require a positive year and a season from S1 through S4. Numeric season IDs are not accepted. Separate lifetime Quick Match and Unranked totals may be unavailable; `combined all` requests their recorded combined total. No missing segment is replaced with a different season or fabricated total.

## Slash commands

```text
/r6 profile player:<name> platform:<optional-platform>
/r6 stats player:<name> mode:<mode> platform:<optional-platform> season:<optional-season>
/r6 operator player:<name> operator:<name> platform:<optional-platform>
/r6 help
/r6 ping
```

For example: `/r6 stats player:waifu_-. mode:Ranked season:y9s1`. The season option accepts `current`, `all`, or `YxSx` and uses the same uppercase normalization and format validation as text commands.

The platform becomes required when `defaultPlatform` is `null`. Statistics requests acknowledge the interaction before querying the API. Both transports share validation, cooldowns, API access, and output formatting.

Command definitions use `SlashCommandBuilder` with explicit server installation and server/bot-DM interaction contexts. Registration uses the authenticated client's REST manager and `Routes.applicationCommands`, following the [official discord.js example](https://discord.js.org/docs/packages/discord.js/14.27.0). No application ID or guild scope setting is needed in `config.js`.

Statistics use compact Win/Loss, K/D, and headshot or kills-per-match groups, with available level, playtime, and rank information. Missing values are omitted; recorded zeroes remain visible. Seasonal results show the mode, `YxSx`, and available season name, for example `Ranked • Y9S1 • Deadly Omen`. Lifetime totals are labeled `Lifetime`. Operator statistics identify their cumulative coverage from Y8S1 onward and exclude Arcade and Event. Rank points retain RP or historical MMR, and operator round wins are labeled separately from match wins. Embed timestamps show source retrieval time, including cached retrieval time.

## Deploy with Docker Compose

Create `.env`, configure `config.js`, then run:

```sh
docker compose up -d --build
docker compose logs -f r6bot
```

The Dockerfile pins `node:24.21.0-bookworm-slim` for both compilation and production. Compose injects `.env`, mounts `config.js` read-only, and persists `/bot/logs` in the `bot-logs` named volume. The image includes production dependencies, Chromium, and its Linux libraries, and runs as a non-root user. Credentials are excluded from the build context. The init process and shutdown handlers release Discord and browser resources.

```sh
docker compose restart r6bot
docker compose down
```

Restart after configuration changes. Rebuild after source or dependency changes.

## Development and checks

```sh
npm run check
```

This runs strict type checking, ESLint, basic unit tests, and the production build. Tests run directly from TypeScript with Node.js's built-in test runner and use fabricated data; no token, browser, or live service is required. CI runs the same checks without dependency install scripts.

Developer-only scripts under `scripts/` use kebab-case `.ts` filenames and run directly without emitting `.js`:

```sh
npm run docker:build
npm run docker:build -- my-r6bot:3.0.0
npm run docker:build:test
npm run api:smoke -- pc "waifu_-."
npm run runtime:smoke
```

The build command defaults to `r6bot:latest`. Pass one explicit `image_name:tag` to choose a different image, including names such as `hmes98318/r6bot:3.0.0` or `ghcr.io/hmes98318/r6bot:3.0.0`.

The build test checks Dockerfile and Compose configuration, builds a temporary image, verifies metadata, runtime files, and log writing, launches headless Chromium in a container with networking disabled, and removes its test image. The API smoke script performs one real public profile query and closes its client. The runtime smoke script uses a synthetic worker to verify fatal restart, rejected-promise isolation, and flushed logs without a token or network access. Manual scripts are excluded from unit tests and CI. Each supports `--help`.

See [development documentation](docs/development.md) and [AGENTS.md](AGENTS.md) for architecture and contributor rules. Code follows the [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html), with four-space indentation, semicolons, JSDoc comments, ESLint, and `.editorconfig`. Development documentation and Conventional Commit messages use en-US.
