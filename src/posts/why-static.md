---
title: "Why I built this site static"
date: 2026-10-15
summary: "A short case for pre-rendered HTML, and what it costs you."
tags: ["web", "performance"]
---

The modern web has an extraordinary amount of machinery dedicated to showing
you a paragraph of text. A typical article page ships a framework, a hydration
runtime, a CSS-in-JS layer, and a handful of analytics beacons &mdash; often
several megabytes to render content that has not changed in months.

This site takes the opposite bet: **pre-render everything at build time and
ship the result as files.**

## What that buys you

- **Time to first byte is boring.** The server (or CDN) hands back complete
  HTML. There is nothing to hydrate; the browser paints and it is done.
- **It works without JavaScript.** Every word on this site is present in the
  HTML. If scripting is off, the only thing you lose is the theme toggle.
- **It ages well.** Static files from 2005 still work. A build pipeline pinned
  to today's framework version does not necessarily.
- **Caching is trivial.** Content-hash the assets, set a long `max-age`, move
  on.

## What it costs you

Static generation is not free; the cost just moves earlier:

1. **Build time grows with content.** Ten thousand pages is a different
   problem from ten.
2. **Dynamic features need a plan.** Comments, search, and personalization all
   require either a service or a build-step trick. I have none of them here, so
   this cost is zero *for now*.
3. **You own the pipeline.** There is no platform team to page when the build
   breaks.

For a personal site, those trade-offs are easy. The number I care about most is
how quickly a cold cache reads the first sentence, and static wins that round
by a wide margin.
