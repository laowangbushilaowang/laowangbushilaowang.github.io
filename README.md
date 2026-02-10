# Bohan Wang Academic Website

A static-first, research-oriented personal homepage built with Next.js App Router, TypeScript, Tailwind CSS, and Framer Motion.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Framer Motion
- Markdown blog content
- Static export (`output: "export"`) for GitHub Pages

## Local Development

### 1. Prerequisites

- Node.js 20 LTS (see `.nvmrc`)
- npm 10+

### 2. Install dependencies

```bash
npm install
```

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Production checks

```bash
npm run typecheck
npm run lint
npm run build
```

Static output is generated in `out/`.

## Content Update Guide

All main content is centralized in typed files under `src/content`.

- Site profile and navigation:
  - `src/content/site.ts`
- Education:
  - `src/content/education.ts`
- Research themes:
  - `src/content/research.ts`
- Projects:
  - `src/content/projects.ts`
- News timeline:
  - `src/content/news.ts`
- Social links:
  - `src/content/social.ts`
- CV-specific entries (experience, skills, awards):
  - `src/content/cv.ts`
- Publications placeholder (future extension):
  - `src/content/publications.ts`

## Blog Authoring

Blog posts are Markdown files in:

- `content/blog/*.md`

Each post needs frontmatter:

```md
---
title: "Post title"
date: "2026-02-10"
excerpt: "Short summary"
tags:
  - AI
  - Research
draft: false
---

Post content...
```

Notes:

- Filename becomes URL slug (for `content/blog/my-post.md`, route is `/blog/my-post`).
- Posts are automatically sorted by `date` descending.
- `draft: true` hides a post from listing.

## News Update Workflow

Add or edit items in one place:

- `src/content/news.ts`

Use `YYYY-MM` dates for timeline consistency.

## CV PDF Replacement

Current CV file:

- `public/files/Bohan_Wang_CV.pdf`

To update:

1. Replace this file with the new PDF.
2. Keep the same filename to avoid changing links.

## Deployment (GitHub Pages - Default)

This repo includes GitHub Actions workflow:

- `.github/workflows/deploy.yml`

### Steps

1. Push to `main`.
2. In GitHub repo settings, go to `Pages`.
3. Set source to `GitHub Actions`.
4. The workflow builds static assets and deploys from `out/`.

### Base path behavior

`next.config.mjs` auto-configures `basePath`/`assetPrefix` using `GITHUB_REPOSITORY`:

- For `username.github.io`: no base path.
- For project repos: `/<repo-name>` base path.

## Optional Deployment (Vercel)

You can deploy the same project to Vercel:

1. Import repository in Vercel.
2. Framework preset: Next.js.
3. Build command: `npm run build`.
4. Output directory: `out` (for static export flow).

## Project Structure

```txt
src/
  app/
    about/
    blog/
      [slug]/
    contact/
    cv/
    news/
    projects/
    research/
    globals.css
    layout.tsx
    page.tsx
  components/
    layout/
    motion/
    sections/
    ui/
  content/
  lib/
  types/
content/
  blog/
public/
  files/
```
