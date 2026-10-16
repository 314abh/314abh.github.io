import { EleventyHtmlBasePlugin } from "@11ty/eleventy";
import rssPlugin from "@11ty/eleventy-plugin-rss";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import katexImport from "@vscode/markdown-it-katex";
import { minify } from "html-minifier-terser";

const katex = katexImport.default ?? katexImport;

const readableDate = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const longDate = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export default function (eleventyConfig) {
  eleventyConfig.addPlugin(rssPlugin);
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  eleventyConfig.amendLibrary("md", (md) =>
    md.use(katex, { throwOnError: false, errorColor: "#cc241d" })
  );

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ CNAME: "CNAME" });
  eleventyConfig.addPassthroughCopy({
    "node_modules/@fontsource/vt323/files/vt323-latin-400-normal.woff2":
      "assets/fonts/vt323/vt323-latin-400-normal.woff2",
    "node_modules/@fontsource/vt323/files/vt323-latin-ext-400-normal.woff2":
      "assets/fonts/vt323/vt323-latin-ext-400-normal.woff2",
    "node_modules/katex/dist/katex.min.css": "assets/katex/katex.min.css",
    "node_modules/katex/dist/fonts/*.woff2": "assets/katex/fonts",
  });

  eleventyConfig.addFilter("readableDate", (value) =>
    readableDate.format(new Date(value))
  );

  eleventyConfig.addFilter("longDate", (value) =>
    longDate.format(new Date(value))
  );

  eleventyConfig.addFilter("machineDate", (value) =>
    new Date(value).toISOString()
  );

  eleventyConfig.addFilter("year", (value) => new Date(value).getFullYear());

  eleventyConfig.addFilter("limit", (array, count) =>
    (array || []).slice(0, count)
  );

  eleventyConfig.addFilter("excerpt", (content, length = 240) => {
    const text = String(content)
      .replace(/<[^>]*>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
  });

  eleventyConfig.addFilter("byTag", (posts, tag) =>
    (posts || []).filter((post) => (post.data.tags || []).includes(tag))
  );

  eleventyConfig.addFilter("adjacentPost", (posts, url, offset) => {
    const index = (posts || []).findIndex((post) => post.url === url);
    if (index === -1) return null;
    return posts[index + offset] || null;
  });

  eleventyConfig.addFilter("readingTime", (content) => {
    const words = String(content)
      .replace(/<[^>]*>/g, " ")
      .split(/\s+/)
      .filter(Boolean).length;
    return `${Math.max(1, Math.round(words / 200))} min read`;
  });

  eleventyConfig.addCollection("posts", (collectionApi) =>
    collectionApi
      .getFilteredByTag("posts")
      .sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addCollection("postsByYear", (collectionApi) => {
    const posts = collectionApi
      .getFilteredByTag("posts")
      .sort((a, b) => b.date - a.date);
    const groups = new Map();
    for (const post of posts) {
      const year = new Date(post.date).getFullYear();
      if (!groups.has(year)) groups.set(year, []);
      groups.get(year).push(post);
    }
    return [...groups.entries()].map(([year, items]) => ({ year, items }));
  });

  eleventyConfig.addCollection("tagList", (collectionApi) => {
    const tags = new Set();
    for (const post of collectionApi.getFilteredByTag("posts")) {
      for (const tag of post.data.tags || []) {
        if (tag !== "posts") tags.add(tag);
      }
    }
    return [...tags].sort();
  });

  if (process.env.NODE_ENV === "production") {
    eleventyConfig.addTransform("minify", async (content, outputPath) => {
      if (outputPath && outputPath.endsWith(".html")) {
        return await minify(content, {
          collapseWhitespace: true,
          removeComments: true,
          minifyCSS: true,
          minifyJS: true,
        });
      }
      return content;
    });
  }

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["md", "njk"],
  };
}
