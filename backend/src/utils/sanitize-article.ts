import sanitizeHtml from "sanitize-html";

const options: sanitizeHtml.IOptions = {
  allowedTags: sanitizeHtml.defaults.allowedTags.concat([
    "img", "h1", "h2", "table", "thead", "tbody", "tr", "th", "td", "div", "span",
  ]),
  allowedAttributes: {
    ...sanitizeHtml.defaults.allowedAttributes,
    "*": ["class"],
    a: ["href", "target", "rel", "class"],
    img: ["src", "alt", "width", "height", "loading", "class"],
  },
  allowedSchemes: ["http", "https", "mailto"],
};

export function sanitizeArticleHtml(content: string): string {
  return sanitizeHtml(content, options);
}
