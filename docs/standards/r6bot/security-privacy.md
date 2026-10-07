# Security and Privacy

- Never commit, embed, print, or include bot tokens and `.env` files in images. Use `.env.example` only for a placeholder.
- Redact credentials from command and error logs. Keep rotating logs and their metadata out of version control and build contexts. Log selected diagnostics rather than entire interactions or HTTP objects.
- Request Discord intents and permissions needed by enabled command transports. Do not require administrator permissions.
- Disable automatic mentions in replies and escape external names in Discord Markdown.
- Validate usernames, platforms, seasons, configuration, and image tags before they reach external APIs or subprocesses.
- Return safe, actionable error messages. Do not send raw exceptions, upstream bodies, session headers, or credentials to Discord users.
- Reuse the API client's bounded cache and retry policy. Bound simultaneous bot queries and prevent duplicate work by the same Discord user.
- Use isolated background browser contexts. Never read a developer's personal browser profile or saved credentials.
- Shut down Discord and browser resources on process termination. Container smoke tests must not connect to Discord or require a bot token.
