# 314abh.cc

My personal blog, built with [Eleventy](https://www.11ty.dev/). Static HTML,
small enough to read on a bad connection, no tracking, no client-side framework.

## Stack

- **Eleventy 3** — static site generator
- **Nunjucks** — templating
- **Markdown + KaTeX** — posts, with math rendered at build time (zero runtime JS)
- **Prism** (via `@11ty/eleventy-plugin-syntaxhighlight`) — code highlighting
- **VT323** — self-hosted retro typeface for headings (no third-party font requests)

No CSS framework, no client-side JavaScript beyond a few lines that remember your
light/dark theme.

## Local development

Requires Node 20+ (developed on Node 22).

```sh
npm install
npm run dev      # start the dev server at http://localhost:8080 with live reload
npm run build    # build to _site/
npm run clean    # remove _site/
```

`npm run dev` serves and watches. `npm run build` is what CI runs; it minifies
HTML when `NODE_ENV=production`.

## Writing a post

Create a Markdown file in `src/posts/`, e.g. `src/posts/my-post.md`:

```markdown
---
title: "My post"
date: 2026-10-20
summary: "One-line summary used for feeds and previews."
tags: ["c", "kernel"]
math: false
---

Body goes here. It's plain Markdown, with `code`, lists, tables, and so on.
```

The filename becomes the URL: `src/posts/my-post.md` → `/posts/my-post/`.
Tags generate `/tags/<tag>/` pages automatically.

### Math

Set `math: true` in a post's front matter and write LaTeX with `$...$` (inline)
or `$$...$$` (display). It is rendered to static HTML at build time by KaTeX, so
visitors pay nothing at runtime. The KaTeX stylesheet is only loaded on pages
that set `math: true`.

## Structure

```
src/
  _data/            site metadata, build data, badge list
  _includes/        layouts (base, post, page) and components
  assets/           css, fonts, favicon, 88x31 buttons (copied as-is)
  pages/            about, links, now
  posts/            blog posts (Markdown)
  index.njk         home
  posts.njk         /posts/ index, grouped by year
  tags.njk          /tags/<tag>/ pages
  feed.njk          Atom feed
  sitemap.njk       sitemap.xml
  robots.njk        robots.txt
eleventy.config.js  all build configuration
```

## Making it yours

Most personal details live in one place: `src/_data/site.json` (title, tagline,
description, nav, social links, webring). Edit that first.

- **Colors / theming** — `src/assets/css/style.css`, the `:root` custom properties.
- **Badges in the footer** — `src/_data/buttons.js`.
- **Bio / colophon** — `src/pages/about.md`.
- **Blogroll** — `src/pages/links.md` and `src/pages/now.md`.

## Deploying

Pushing to `master` triggers `.github/workflows/deploy.yml`, which builds the
site and publishes `_site/` to GitHub Pages. One-time setup:

1. In the repo, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
2. Make sure the custom domain is set to `314abh.cc` in the same screen.
   The `CNAME` file is copied into the build by `eleventy.config.js`.

If you prefer to keep the source on a branch other than `master`, change the
`branches:` list in the workflow.
