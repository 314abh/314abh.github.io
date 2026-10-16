---
title: "links"
summary: "A blogroll of sites worth your time."
---

The web is better when it points outward. These are pages I actually read,
kept as a small stand against the algorithm.

## Blogroll

- [riggraz.dev](https://riggraz.dev) &mdash; thoughts on programming, digital
  wellbeing, and AI.
- [0x42.sh](https://0x42.sh) &mdash; Bryan Brattlof's notes on the Linux
  kernel, tooling, and datasets.
- [quiltro.org](https://quiltro.org) &mdash; a warm, hand-made personal site
  with pixel art and a good webring.
- [tilde.town/~elly](https://tilde.town/~elly/) &mdash; small web, big
  personality; proof that a page can be tiny and lovely.
- [Eleventy](https://www.11ty.dev/) &mdash; the static site generator behind
  this site.

## Badges

If you run a personal site, the classic 88&times;31 button is still the
friendliest way to link out. Here are mine, and a couple I wear with pride:

<ul class="buttons">
{% for button in buttons %}
  <li><a href="{{ button.url }}"><img src="{{ button.img }}" alt="{{ button.alt }}" width="88" height="31" loading="lazy"></a></li>
{% endfor %}
</ul>

## Webring

<p class="webring-inline"><a href="/links/">&larr; previous</a> &middot; <a href="/links/">{{ site.webring.name }}</a> &middot; <a href="/links/">next &rarr;</a></p>

If you would like your site added here, send me a link.
