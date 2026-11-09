import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import hljs from "highlight.js/lib/core";
import typescript from "highlight.js/lib/languages/typescript";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import xml from "highlight.js/lib/languages/xml";
import plaintext from "highlight.js/lib/languages/plaintext";
import "highlight.js/styles/github-dark.css";
import { Check, Copy, FileCode2, Globe, Info, Smartphone } from "lucide-react";

hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("plaintext", plaintext);

export type Lang = "typescript" | "json" | "bash" | "xml" | "plaintext";
export type CodeMode = "app" | "web";

/* Aba App/Web global: trocar em um slide troca em todos */
export const CodeModeContext = createContext<{ mode: CodeMode; setMode: (m: CodeMode) => void }>({
  mode: "app",
  setMode: () => {},
});

const langOf = (file: string): Lang => (file.endsWith(".json") ? "json" : "typescript");

export function Highlight({ code, lang }: { code: string; lang: Lang }) {
  const html = useMemo(() => hljs.highlight(code, { language: lang }).value, [code, lang]);
  return (
    <pre>
      <code dangerouslySetInnerHTML={{ __html: html }} />
    </pre>
  );
}

function CopyButton({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      className="copy"
      onClick={() => {
        navigator.clipboard?.writeText(text).then(() => {
          setDone(true);
          setTimeout(() => setDone(false), 1500);
        });
      }}
    >
      {done ? <Check /> : <Copy />}
      {done ? "Copiado" : "Copiar"}
    </button>
  );
}

/** Painel de código com um título fixo (sem abas). Aceita vários blocos. */
export function CodePanel({
  title, file, blocks, icon,
}: {
  title: string;
  file?: string;
  icon?: ReactNode;
  blocks: { code: string; lang: Lang }[];
}) {
  return (
    <div className="code">
      <div className="code-bar">
        <span className="tab on static">{icon ?? <FileCode2 />}{title}</span>
        {file && <span className="file">{file}</span>}
      </div>
      {blocks.map((b, i) => <Highlight key={i} code={b.code} lang={b.lang} />)}
    </div>
  );
}

/** Painel com abas App (padrão) e Web. */
export function CodeTabs({
  app, web, note,
}: {
  app: { file: string; code: string };
  web: { file: string; code: string };
  note?: string;
}) {
  const { mode, setMode } = useContext(CodeModeContext);
  const cur = mode === "app" ? app : web;
  return (
    <div className="code">
      <div className="code-bar">
        <button className={`tab ${mode === "app" ? "on" : ""}`} onClick={() => setMode("app")}>
          <Smartphone /> App (Android/iOS)
        </button>
        <button className={`tab ${mode === "web" ? "on" : ""}`} onClick={() => setMode("web")}>
          <Globe /> Web
        </button>
        <span className="file">{cur.file}</span>
        <CopyButton text={cur.code} />
      </div>
      <Highlight code={cur.code} lang={langOf(cur.file)} />
      {note && <div className="note"><Info />{note}</div>}
    </div>
  );
}
