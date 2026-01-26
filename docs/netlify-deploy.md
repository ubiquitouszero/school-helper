# Netlify Deployment Guide

**This project is hosted on Netlify.**

---

## Quick Deploy

```bash
# 1. Build the site
npm run build

# 2. Draft deploy (preview URL)
npx netlify deploy --dir=dist

# 3. Production deploy (live site)
npx netlify deploy --dir=dist --prod
```

---

## First Time Setup

### Check CLI

```bash
npx netlify --version
```

### Link to Site

If you get "Site not found" errors:
```bash
npx netlify link
```

Select the existing site or create a new one.

### Login

If you get auth errors:
```bash
npx netlify login
```

---

## Common Errors

### "No site id found" / "Site not found"

Run:
```bash
npx netlify link
```

This creates `.netlify/state.json` with the site ID.

### "Deploy directory not found"

Build first:
```bash
npm run build
ls dist/  # verify files exist
npx netlify deploy --dir=dist
```

### "Not authorized"

```bash
npx netlify login
```

---

## Project Config

The `netlify.toml` is already configured:

```toml
[build]
  command = "npm run build"
  publish = "dist"
```

- Build output: `dist/`
- Build command: `npm run build`
- Node version: 20

---

## Do NOT

- Try `netlify` without `npx` (not in PATH)
- Deploy without building first
- Use wrong directory (it's `dist`, not `build` or `public`)
