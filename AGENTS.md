**Agents Guide**
- Purpose: give agentic coding agents the commands and code-style conventions used in this repository; follow these rules when editing, adding or reviewing code.

- Repo files of interest: `package.json`, `tsconfig.json`, `eslint.config.mjs`, `scripts/check-frontmatter.js`.

**Build & Run Commands**
- Start development server (fast feedback): `pnpm dev` or `npm run dev` — runs `next dev`.
- Build for production: `pnpm build` or `npm run build` — runs `next build`.
- Start production server: `pnpm start` or `npm run start` — runs `next start` after a successful build.
- Linting (ESLint): `pnpm lint` or `npm run lint` — runs `eslint` using `eslint.config.mjs`.
- Frontmatter check: `pnpm run lint:frontmatter` or `npm run lint:frontmatter` — runs `node scripts/check-frontmatter.js` to validate markdown frontmatter.

- Install dependencies (preferred): `pnpm install` (this repository contains `pnpm-lock.yaml`). `npm install` or `yarn` are acceptable alternatives but agents should default to `pnpm` when scripting here.

**Type-checking / Formatting helpers**
- Type-only compile check: `pnpm exec tsc --noEmit`.
- ESLint run for specific files/folders: `pnpm exec eslint "./**/*.{ts,tsx,js,jsx,mjs}"`.

**Tests**
- This repository does not include a test runner by default. If you add tests, follow these conventions:
  - Preferred runners: `vitest` (fast, Vite-friendly) or `jest` (widely used). Add a `test` script in `package.json`.
  - Run all tests: `pnpm test` or `pnpm exec vitest`.
  - Run a single test file (examples):

```bash
# Vitest: run a single test file
pnpm exec vitest path/to/file.test.ts

# Vitest: run a single test by name
pnpm exec vitest -t "name of test"

# Jest: run a single test file
pnpm exec jest path/to/file.test.ts --runTestsByPath

# Jest: run a single test by name
pnpm exec jest -t "name of test"
```

- If you add tests, include a `test` and `test:watch` script in `package.json` and document how to run a single test in this file.

**Code Style & Guidelines (for agents)**
- Authoritative configs: follow `tsconfig.json` (strict mode enabled) and `eslint.config.mjs` (extends Next.js rules). When rules conflict, prefer those files.

- Formatting
- Use a consistent formatter (Prettier or built-in editor format). If you add Prettier, add a config file and format changed files before committing.
- Wrap JSX attributes and long expressions to keep line length readable (≈100 chars). Be consistent with the existing code style in this repo.

- TypeScript & Types
- `tsconfig.json` has `strict: true`. Keep strictness — prefer explicit types for public APIs and component props. Use inference for small local variables when it's clear.
- Avoid `any` unless a short, well-documented exception; prefer `unknown` + narrowing where appropriate.
- Use discriminated unions for variants and `zod` for runtime validation where input comes from untrusted sources (this repo already depends on `zod`).

- Imports
- Absolute imports via path mapping `@/*` are configured in `tsconfig.json`. Use `@/` for top-level project imports when it improves clarity. Example: `import X from '@/lib/utils'`.
- Group imports and order them consistently: external packages first, blank line, absolute project imports, blank line, relative imports. Avoid deep relative paths (like `../../../../../`); prefer `@/` paths.
- Keep import lines small; prefer named imports when importing multiple helpers from a package.

- React / Next.js specifics
- Use server and client components intentionally: mark client components with `'use client'` at the top when needed. Keep data-fetching and heavy IO in server components where possible.
- For component props, prefer an explicit `interface Props { ... }` and annotate the component: `function MyComponent(props: Props) {}` or `const C: React.FC<Props> = () => {}` — consistent with surrounding files.
- Prefer semantic HTML and accessibility: provide `alt` on images, label form controls, use headings in order.

- Naming Conventions
- Use camelCase for variables and functions, PascalCase for React components and types/interfaces. Files follow kebab-case or camelCase as currently present (match existing file naming in `components/`).
- Use clear, descriptive names: prefer `getPosts`, `searchPosts` over vague names like `doThing`.

- Error Handling
- Prefer returning or throwing typed errors with context. For async functions, prefer `try/catch` with specific error handling and rethrow enriched errors when necessary.
- For unexpected runtime errors in server code, surface an informative message but avoid leaking secrets.

- Logging and Telemetry
- Keep console logging minimal and informative. Use structured logs when adding telemetry.

- Small, Focused PRs
- Agents should create small, focused changes. Each PR should implement one concern (fix, feature, refactor) and include tests or manual verification steps where applicable.

**When Editing Files**
- Follow the repository's conventions. Do not reformat unrelated files.
- Add or update `package.json` scripts only when necessary and document them in this AGENTS.md.

**Developer Tooling & Editor Settings**
- The repo has `tsconfig.json` and ESLint config. Use an editor that respects TypeScript and ESLint diagnostics.
- Enable `editor.formatOnSave` and `eslint` code actions if possible, but ensure changes match the project's style.

**Cursor / Copilot Rules**
- No `.cursor/rules/` or `.cursorrules` directory found in the repository root.
- No repository-level Copilot instructions file at `.github/copilot-instructions.md` was found.
- If you (agent) add Cursor or Copilot rules, document them here and commit the rules files to the repository.

**Commit & Branching Guidance for Agents**
- Use feature branches for non-trivial changes and descriptive commit messages: `feat: add X`, `fix: correct Y`, `chore: update deps`.
- Do not amend or rewrite other authors' commits. Avoid destructive Git commands unless explicitly requested.

**What to do if you are blocked**
- Inspect `tsconfig.json` and `eslint.config.mjs` first. Search codebase for similar patterns when you are unsure.
- If ambiguity remains and changes are non-trivial, leave a concise comment in the PR describing the choice and expected follow-ups.

**Next Actions for Contributors / Agents**
- If you add tests, update this file with the exact `test` script and a one-line example of running a single test.
- If you add Prettier or other formatting tooling, add a note here and include the config files in the commit.

---
Files referenced: `package.json`, `tsconfig.json`, `eslint.config.mjs`, `scripts/check-frontmatter.js`.
