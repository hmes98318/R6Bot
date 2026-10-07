# Coding Style

Follow the [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html) with these project requirements:

- Indent JavaScript and TypeScript code with four spaces. Use two-space indentation in `compose.yaml`. Use semicolons, single-quoted JavaScript strings, LF endings, and UTF-8. Follow `.editorconfig` and the ESLint flat configuration.
- Keep source lines within 80 columns, with the linter's exceptions for URLs and literals that should not be split.
- Use named exports in application code. Tool configuration may use default exports when its loader requires them.
- Use `UpperCamelCase` for types and classes, `lowerCamelCase` for functions and variables, and `CONSTANT_CASE` for module constants.
- Name files in `kebab-case`, including every TypeScript script under `scripts/`.
- Write code comments in JSDoc format. Document public behavior and non-obvious decisions; avoid redundant comments and TypeScript types repeated in JSDoc tags.
- Prefer `const`, explicit return types, type-only imports, and discriminated unions. Avoid `any`, non-null assertions, parameter properties, and unchecked type assertions.
- Keep external input as `unknown` until validated. Preserve numeric zeroes and nullable upstream data.
- Keep command parsing, API access, rendering, and Discord event handling in separate modules.
