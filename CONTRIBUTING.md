# Contributing to Ramzure

Thanks for helping make cloud and cybersecurity learning free for everyone! 💙

## Ways to contribute

- 🐛 Report bugs
- 💡 Suggest new services or security labs
- 📝 Add learning-path lessons or quiz questions (`src/pages/discoverData.ts`)
- 🛡️ Add new recommendations or threat types (`src/data.ts`)
- 🎨 Improve design and accessibility

## Development setup

```bash
git clone https://github.com/Vaibhav222209/ramzure.git
cd ramzure
npm install
npm run dev
```

Before opening a pull request, make sure the project builds:

```bash
npx tsc --noEmit
npm run build
```

## Pull request process

1. Fork the repo and create a branch: `git checkout -b feat/my-feature`
2. Make focused changes with clear commit messages (we like [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`).
3. Run the checks above.
4. Open a PR using the template and describe *what* and *why*.

## Code style

- TypeScript, functional React components and hooks.
- Tailwind CSS utility classes; reuse primitives from `src/ui.tsx`.
- Keep state changes in `src/store.tsx` or via `useStore()` helpers.

## Code of Conduct

By participating you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

— Maintained by [Vaibhav Thakur](https://github.com/Vaibhav222209)
