# Repository Guidelines

## Project Structure & Module Organization

This is a browser-only multimodal Agnes client built with Vite, React, TypeScript, Tailwind CSS v4, shadcn/ui, and LangGraph.js. Application entry points live in `src/main.tsx` and `src/App.tsx`. Put feature UI in `src/components/`; reusable shadcn primitives belong in `src/components/ui/`. Keep API integration, agent orchestration, browser storage, and shared helpers in `src/lib/`. Shared TypeScript types are in `src/types.ts`, styles in `src/index.css`, and static showcase assets in `assets/`. Deployment settings are in `netlify.toml`.

## Build, Test, and Development Commands

Use the lockfile’s package manager where possible: `pnpm install` and `pnpm dev`. The available scripts are:

- `pnpm dev` — start the Vite development server.
- `pnpm typecheck` — run TypeScript project checks without emitting output.
- `pnpm build` — type-check, then create the production bundle in `dist/`.
- `pnpm preview` — serve the production build locally.

There is currently no automated test command. For changes, at minimum run `pnpm typecheck`, then `pnpm build`; manually verify the affected prompt, generation, and history flow in the browser.

## Coding Style & Naming Conventions

Use TypeScript and functional React components. Follow the existing style: two-space indentation, double quotes, no semicolons, and `@/` imports for code under `src/`. Name components with PascalCase (`PromptComposer.tsx`), hooks and helpers with camelCase (`readConversation`), and keep related API/browser-storage behavior in focused modules under `src/lib/`. Prefer Tailwind utility classes and existing shadcn primitives over one-off CSS or duplicated controls. Use English filenames for Markdown documents (for example, `course-outline.md`).

## Security & Configuration

The browser sends requests directly to Agnes. API keys and conversation history are stored in `localStorage`; do not add keys, tokens, or generated user data to the repository. Configure model endpoints through `VITE_AGNES_*` environment variables documented in `README.md`. Treat all `VITE_` values as client-visible.

## Commit & Pull Request Guidelines

Use short, imperative commit subjects that describe the delivered change, such as `add reference image upload` or `Fix long conversation scroll`. Keep commits focused. Pull requests should explain the user-facing behavior, list validation commands, link the relevant issue when available, and include screenshots or a brief recording for UI changes. Call out any environment-variable or deployment changes explicitly.
