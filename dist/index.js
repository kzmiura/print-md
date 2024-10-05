"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const markdown_it_1 = __importDefault(require("markdown-it"));
const markdown_it_katex_1 = __importDefault(require("@vscode/markdown-it-katex"));
const puppeteer_core_1 = __importDefault(require("puppeteer-core"));
const highlight_js_1 = __importDefault(require("highlight.js"));
const util_1 = require("util");
const args = process.argv.slice(2);
const { values, positionals } = (0, util_1.parseArgs)({
    args,
    options: {
        positionals: {
            type: "string",
            multiple: true,
        },
        html: {
            type: "boolean",
        },
        header: {
            type: "boolean",
        },
    },
    allowPositionals: true,
});
for (const filename of positionals) {
    const markdownFilePath = path_1.default.resolve(filename);
    const md = (0, markdown_it_1.default)({
        highlight: (str, lang) => {
            if (lang && highlight_js_1.default.getLanguage(lang)) {
                try {
                    return highlight_js_1.default.highlight(str, { language: lang }).value;
                }
                catch (__) { }
            }
            return "";
        },
        html: true,
        linkify: true,
    }).use(markdown_it_katex_1.default);
    try {
        const markdown = (0, fs_1.readFileSync)(markdownFilePath, { encoding: "utf-8" });
        const html = `
  <!DOCTYPE html>
  <html>
    <head>
      <title>${path_1.default.basename(markdownFilePath)}</title>
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
        if (values.html) {
            (0, fs_1.writeFileSync)(path_1.default.resolve(`${path_1.default.parse(markdownFilePath).name}.html`), html);
        }
        (() => __awaiter(void 0, void 0, void 0, function* () {
            const browser = yield puppeteer_core_1.default.launch({
                channel: "chrome",
            });
            const page = yield browser.newPage();
            yield page.setContent(html);
            yield page.pdf({
                path: path_1.default.resolve(`./${path_1.default.parse(markdownFilePath).name}.pdf`),
                format: "A4",
                margin: {
                    top: "0.39in",
                    right: "0.39in",
                    bottom: "0.39in",
                    left: "0.39in",
                },
                displayHeaderFooter: values.header,
                printBackground: true,
            });
            yield browser.close();
            console.info(`${filename}: done`);
        }))();
    }
    catch (e) {
        console.error(e);
    }
}
