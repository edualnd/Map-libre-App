import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import hljs from "highlight.js/lib/core";
import typescript from "highlight.js/lib/languages/typescript";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import xml from "highlight.js/lib/languages/xml";
import plaintext from "highlight.js/lib/languages/plaintext";
import "highlight.js/styles/github-dark.css";
import { Check, Copy, FileCode2, FileJson, Globe, Info, Smartphone } from "lucide-react";

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

export function Highlight({ code, lang, marks }: { code: string; lang: Lang; marks?: number[] }) {
  const html = useMemo(() => {
    const out = hljs.highlight(code, { language: lang }).value;
    if (!marks?.length) return out;
    // Envolve as linhas marcadas (os tokens do hljs não atravessam quebras de linha em JSON)
    return out.split("\n").map((l, i) => (marks.includes(i) ? `<span class="hl-line">${l}</span>` : l)).join("\n");
  }, [code, lang, marks]);
  // Rola até a primeira linha destacada (sem mexer no resto da página)
  const preRef = useRef<HTMLPreElement>(null);
  useEffect(() => {
    const pre = preRef.current;
    const el = pre?.querySelector<HTMLElement>(".hl-line");
    if (pre && el) pre.scrollTop = Math.max(0, el.offsetTop - pre.clientHeight / 3);
  }, [html]);
  return (
    <pre ref={preRef}>
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

/** Painel com abas App (padrão) e Web, e opcionalmente uma aba extra (ex.: um arquivo de dados). */
export function CodeTabs({
  app, web, note, extra, extraFirst = false,
}: {
  app: { file: string; code: string };
  web: { file: string; code: string };
  note?: string;
  extra?: { file: string; code: string; note?: string; marks?: number[] };
  /** Mostra a aba extra primeiro e já selecionada. */
  extraFirst?: boolean;
}) {
  const { mode, setMode } = useContext(CodeModeContext);
  const [extraOn, setExtraOn] = useState(extraFirst);
  const showExtra = extra && extraOn;
  const cur = showExtra ? extra : mode === "app" ? app : web;
  const curNote = showExtra ? extra.note : note;
  const pick = (m: CodeMode) => { setExtraOn(false); setMode(m); };
  return (
    <div className="code">
      <div className="code-bar">
        {extra && extraFirst && (
          <button className={`tab ${showExtra ? "on" : ""}`} onClick={() => setExtraOn(true)}>
            <FileJson /> {extra.file}
          </button>
        )}
        <button className={`tab ${!showExtra && mode === "app" ? "on" : ""}`} onClick={() => pick("app")}>
          <Smartphone /> App (Android/iOS)
        </button>
        <button className={`tab ${!showExtra && mode === "web" ? "on" : ""}`} onClick={() => pick("web")}>
          <Globe /> Web
        </button>
        {extra && !extraFirst && (
          <button className={`tab ${showExtra ? "on" : ""}`} onClick={() => setExtraOn(true)}>
            <FileJson /> {extra.file}
          </button>
        )}
        <span className="file">{cur.file}</span>
        <CopyButton text={cur.code} />
      </div>
      <Highlight code={cur.code} lang={langOf(cur.file)} marks={showExtra ? extra.marks : undefined} />
      {curNote && <div className="note"><Info />{curNote}</div>}
    </div>
  );
}
