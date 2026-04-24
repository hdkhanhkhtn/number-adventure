# Deployment

## MVP Target

Static web app hosted on **Vercel** (recommended) or any static host.

## Build

```bash
npm run build
# → .next/ output directory
```

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (first time — follow prompts)
vercel

# Deploy production
vercel --prod
```

Or connect GitHub repo to Vercel dashboard for automatic deploys on push to `main`.

## Deploy to Other Hosts (Netlify, GitHub Pages)

```bash
# Next.js static export (if no SSR needed)
# next.config.js: output: 'export'

npm run build
# → out/ directory (static files)

# Deploy out/ to any static host
```

## Environment Checklist

- [ ] `npm run build` succeeds without errors
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] All tests pass (`npm test -- --watchAll=false`)
- [ ] Audio works on iOS Safari (test on real device)
- [ ] localStorage persists across page refresh
- [ ] All 5 games playable end-to-end
- [ ] Parent gate PIN works

## Performance Targets

- Lighthouse Performance ≥ 75 (mobile)
- First Contentful Paint < 2s (4G)
- Audio response < 100ms on tap

## Post-Deploy Verification

```bash
# Run Lighthouse on deployed URL
npx lighthouse <url> --view --preset=mobile
```
