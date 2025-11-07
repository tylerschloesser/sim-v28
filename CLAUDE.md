# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package Manager

Always use `bun` instead of `npm` for all package management operations.

## Development Commands

- **Install dependencies**: `bun install`
- **Start dev server**: `bun run dev` (do not run this yourself)
- **Build for production**: `bun run build`
- **After code changes**: `bun run check` (auto-fixes lint & prettier, runs type checks - always use this)
- **Type checking only**: `tsc --noEmit` (use this if you only need type validation)
- **Lint**: `bun run lint`
- **Preview production build**: `bun run preview`

## TypeScript Configuration

The project uses a composite TypeScript configuration with project references:

- `tsconfig.json` - Root configuration file
- `tsconfig.app.json` - Configuration for application source code in `src/`
- `tsconfig.node.json` - Configuration for Node.js tooling files

**IMPORTANT**: Always run `bun run check` after making code changes. This command will auto-fix lint and prettier issues, then run type checks. Only use `tsc --noEmit` directly if you specifically need type validation without formatting.

## Project Structure

This is a React 19 + TypeScript + Vite application with the following structure:

- `src/` - Application source code
  - `main.tsx` - Application entry point, renders the root component with StrictMode
  - `App.tsx` - Main App component
  - `assets/` - Static assets (images, etc.)
  - `*.css` - Component and global styles

- `public/` - Static assets served at root
- `index.html` - HTML entry point (Vite uses this as the entry point)

## Technology Stack

- **React**: v19.1.1 (latest with new features)
- **Vite**: v7.1.7 (build tool with HMR)
- **TypeScript**: v5.9.3 (strict mode enabled)
- **ESLint**: v9.36.0 with React Hooks and React Refresh plugins

## Build Tool Details

This project uses Vite with the following configuration:

- `@vitejs/plugin-react` for Fast Refresh with Babel
- Dev server with HMR (Hot Module Replacement)
- Production builds use `tsc -b` for TypeScript compilation followed by `vite build`

## Code Quality

ESLint is configured with:

- TypeScript ESLint recommended rules
- React Hooks recommended rules
- React Refresh rules for Vite
- Browser globals

TypeScript is configured with strict mode and additional checks:

- `noUnusedLocals` and `noUnusedParameters` enabled
- `noFallthroughCasesInSwitch` enabled
- `noUncheckedSideEffectImports` enabled
