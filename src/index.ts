import { readFileSync } from "fs";
import path from "path";
import markdownIt from "markdown-it";
import markdownItKatex from "@vscode/markdown-it-katex";
import puppeteer from "puppeteer-core";
import hljs from "highlight.js";

const argv = process.argv;
if (!argv[2]) {
  process.stdout.write("USAGE: print-md <markdown-file-path>\n");
  process.exit();
}

const markdownFilePath = path.resolve(argv[2]);

const md = markdownIt({
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }
    return "";
  },
  html: true,
  linkify: true,
}).use(markdownItKatex);

try {
  const markdown = readFileSync(markdownFilePath, { encoding: "utf-8" });
  const html = `
<!DOCTYPE html>
<html>
  <head>
    <title>${path.basename(markdownFilePath)}</title>
    <meta charset="utf-8">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/github-markdown-css/5.6.1/github-markdown.css" integrity="sha512-AvF5NBZmABkwjz11vCGYlFOomQB5xFweF9eEsxv/yH3Bd2bAxVzHdwyOeI+JD47wla/9JYhi41s9TXcKbVAqIQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.4/dist/katex.min.css">

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/default.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>

    <!-- and it's easy to individually load additional languages -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/go.min.js"></script>

    <script>hljs.configure({ languages: [] });hljs.highlightAll();</script>
    
    <style>
      .markdown-body pre>code {
        white-space: pre-wrap;
      }
    </style>
  </head>
  <body class="markdown-body">
    ${md.render(markdown)}
  </body>
</html>
`;

  (async () => {
    const browser = await puppeteer.launch({
      channel: "chrome",
    });
    const page = await browser.newPage();
    await page.setContent(html);
    await page.pdf({
      path: path.resolve(`./${path.parse(markdownFilePath).name}.pdf`),
      format: "A4",
      margin: {
        top: "0.39in",
        right: "0.39in",
        bottom: "0.39in",
        left: "0.39in",
      },
      displayHeaderFooter: true,
      printBackground: true,
    });
    await browser.close();

    console.info("Print finished!");
  })();
} catch (e) {
  console.error(e);
}
