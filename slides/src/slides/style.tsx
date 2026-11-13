import { useEffect, useRef, useState } from "react";
import type maplibregl from "maplibre-gl";
import {
  Box, Braces, CircleCheck, CircleX, Database, FileJson, Globe, Smartphone, Layers, Paintbrush, PenTool, Type, Waves,
} from "lucide-react";
import { CodeTabs, Highlight } from "../components/Code";
import { LiveMap } from "../components/LiveMap";
import { I, Kicker } from "../components/ui";
import { CARAGUA, OFM, PLAYGROUND_STYLE, PONTOS, print } from "../data/demos";
import type { SlideDef } from "../deck/Deck";

/* ---------- Expressões ao vivo ---------- */
const FILTERS: { label: string; expr: maplibregl.FilterSpecification | null; code: string }[] = [
  { label: "Todos", expr: null, code: "null  // sem filtro: todos os pontos" },
  { label: "Só praias", expr: ["==", ["get", "tipo"], "praia"], code: '["==", ["get", "tipo"], "praia"]' },
  { label: "Sem praias", expr: ["!=", ["get", "tipo"], "praia"], code: '["!=", ["get", "tipo"], "praia"]' },
];
const WIDTH_EXPR: maplibregl.ExpressionSpecification = ["interpolate", ["linear"], ["zoom"], 10, 0.5, 18, 14];
const widthAt = (z: number) => Math.min(14, Math.max(0.5, 0.5 + ((z - 10) * 13.5) / 8));

/** Linhas do estilo.json que mudaram com o último botão (para o destaque amarelo). */
function markLines(json: string, last: "filter" | "width" | null): number[] {
  if (!last) return [];
  const lines = json.split("\n");
  const key = last === "width" ? '"line-width"' : '"filter"';
  let start = lines.findIndex((l) => l.includes(key));
  if (start < 0) start = lines.findIndex((l) => l.includes('"id": "pontos"')); // filtro removido
  if (start < 0) return [];
  const out = [start];
  // valor em várias linhas: marca até o colchete de fechamento
  if (lines[start].trimEnd().endsWith("[")) {
    for (let i = start + 1; i < lines.length; i++) {
      out.push(i);
      if (lines[i].trim().startsWith("]")) break;
    }
  }
  return out;
}

function ExpressionsDemo() {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [filter, setFilter] = useState(0);
  const [interp, setInterp] = useState(true);
  const [zoom, setZoom] = useState(13);
  const [last, setLast] = useState<"filter" | "width" | null>(null);

  const pickFilter = (i: number) => {
    setFilter(i);
    setLast("filter");
    mapRef.current?.setFilter("pontos", FILTERS[i].expr);
    mapRef.current?.setFilter("pontos-nome", FILTERS[i].expr);
  };
  const toggleWidth = () => {
    setInterp(!interp);
    setLast("width");
    mapRef.current?.setPaintProperty("ruas", "line-width", interp ? 2 : WIDTH_EXPR);
  };

  // Trechos que mudam com os botões
  const width = (pad: string) => interp
    ? `["interpolate", ["linear"], ["zoom"],\n${pad}  10, 0.5,   // zoom 10 → 0,5 px\n${pad}  18, 14],   // zoom 18 → 14 px`
    : `2, // fixo, sem expressão`;
  const f = FILTERS[filter];

  const appCode = `import { Map, Camera, VectorSource, GeoJSONSource, Layer }
  from "@maplibre/maplibre-react-native";
import { PONTOS } from "./pontos"; // praias e pontos de Caraguatatuba

export default function App() {
  return (
    <Map style={{ flex: 1 }}
      mapStyle="https://tiles.openfreemap.org/styles/positron">
      <Camera initialViewState={{ center: [-45.39, -23.615], zoom: 13 }} />

      {/* 2. interpolate — a rua engrossa com o zoom */}
      <VectorSource id="ofm" url="https://tiles.openfreemap.org/planet">
        <Layer id="ruas" type="line" source-layer="transportation"
          paint={{
            "line-color": "#f97316",
            "line-width": ${width("            ")}
          }} />
      </VectorSource>

      <GeoJSONSource id="pontos" data={PONTOS}>
        <Layer id="pontos" type="circle"
${f.expr ? `          filter={${f.code}}  // 3. filter\n` : `          // 3. filter: sem filtro → todos os pontos\n`}          paint={{
            // 1. match — cor por categoria
            "circle-color": ["match", ["get", "tipo"],
              "praia", "#0284c7",
              "mirante", "#16a34a",
              "museu", "#7c3aed",
              "#e11d48"],          // valor padrão
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 5, 16, 13],
            "circle-stroke-width": 2.5,
            "circle-stroke-color": "#ffffff",
          }} />
      </GeoJSONSource>
    </Map>
  );
}`;

  // Só a configuração do estilo: fontes + camadas com as expressões
  const styleJson = print({
    sources: {
      ofm: { type: "vector", url: "https://tiles.openfreemap.org/planet" },
      pontos: { type: "geojson", data: "pontos.json" },
    },
    layers: [
      {
        id: "ruas", type: "line", source: "ofm", "source-layer": "transportation",
        paint: { "line-color": "#f97316", "line-width": interp ? WIDTH_EXPR : 2 },
      },
      {
        id: "pontos", type: "circle", source: "pontos",
        ...(f.expr ? { filter: f.expr } : {}),
        paint: {
          "circle-color": ["match", ["get", "tipo"], "praia", "#0284c7", "mirante", "#16a34a", "museu", "#7c3aed", "#e11d48"],
          "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 5, 16, 13],
          "circle-stroke-width": 2.5,
          "circle-stroke-color": "#ffffff",
        },
      },
    ],
  }, 0, true);

  const webCode = `map.on("load", () => {
  // 2. interpolate — a rua engrossa com o zoom
  map.addSource("ofm", { type: "vector", url: "https://tiles.openfreemap.org/planet" });
  map.addLayer({
    id: "ruas", type: "line", source: "ofm", "source-layer": "transportation",
    paint: {
      "line-color": "#f97316",
      "line-width": ${width("      ")}
    },
  });

  map.addSource("pontos", { type: "geojson", data: PONTOS });
  map.addLayer({
    id: "pontos", type: "circle", source: "pontos",
${f.expr ? `    filter: ${f.code},  // 3. filter\n` : `    // 3. filter: sem filtro → todos os pontos\n`}    paint: {
      // 1. match — cor por categoria
      "circle-color": ["match", ["get", "tipo"],
        "praia", "#0284c7", "mirante", "#16a34a",
        "museu", "#7c3aed", "#e11d48"],
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 5, 16, 13],
      "circle-stroke-width": 2.5,
      "circle-stroke-color": "#ffffff",
    },
  });
});

// Os botões chamam:
map.setFilter("pontos", ${f.expr ? f.code : "null"});
map.setPaintProperty("ruas", "line-width", ${interp ? '["interpolate", ["linear"], ["zoom"], 10, 0.5, 18, 14]' : "2"});`;

  return (
    <div className="demo-grid">
      <LiveMap
        badge={<><Braces /> Dê zoom · use os botões</>}
        options={{ style: `${OFM}/positron`, center: [-45.39, -23.615], zoom: 13 }}
        setup={(m) => {
          mapRef.current = m;
          const onZoom = () => setZoom(m.getZoom());
          m.on("zoom", onZoom);
          m.on("load", () => {
            m.addSource("ofm", { type: "vector", url: "https://tiles.openfreemap.org/planet" });
            m.addLayer({
              id: "ruas", type: "line", source: "ofm", "source-layer": "transportation",
              filter: ["in", ["get", "class"], ["literal", ["primary", "secondary", "tertiary", "minor", "trunk"]]],
              paint: { "line-color": "#f97316", "line-opacity": 0.75, "line-width": WIDTH_EXPR },
            });
            m.addSource("pontos", { type: "geojson", data: PONTOS });
            m.addLayer({
              id: "pontos", type: "circle", source: "pontos",
              paint: {
                "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 5, 16, 13],
                "circle-color": ["match", ["get", "tipo"], "praia", "#0284c7", "mirante", "#16a34a", "museu", "#7c3aed", "#e11d48"],
                "circle-stroke-width": 2.5,
                "circle-stroke-color": "#ffffff",
              },
            });
            m.addLayer({
              id: "pontos-nome", type: "symbol", source: "pontos",
              layout: { "text-field": ["get", "nome"], "text-font": ["Noto Sans Bold"], "text-size": 12, "text-offset": [0, 1.1], "text-anchor": "top" },
              paint: { "text-halo-color": "#ffffff", "text-halo-width": 2 },
            });
          });
          return () => { mapRef.current = null; };
        }}
      >
        <div className="map-info top">
          <div><b>zoom {zoom.toFixed(1)} → line-width</b>{interp ? `${widthAt(zoom).toFixed(1)} px (interpolate)` : "2 px (fixo)"}</div>
        </div>
        <div className="cam-panel">
          <div className="cam-row">
            <code>filter</code>
            {FILTERS.map((f, i) => (
              <button key={f.label} className={i === filter ? "on" : ""} onClick={() => pickFilter(i)}>{f.label}</button>
            ))}
          </div>
          <div className="cam-row">
            <code>width</code>
            <button className={interp ? "on" : ""} onClick={() => !interp && toggleWidth()}>interpolate</button>
            <button className={!interp ? "on" : ""} onClick={() => interp && toggleWidth()}>fixo 2px</button>
          </div>
          <div className="cam-row legend-row">
            <code>match</code>
            <span><i style={{ background: "#0284c7" }} />praia</span>
            <span><i style={{ background: "#16a34a" }} />mirante</span>
            <span><i style={{ background: "#7c3aed" }} />museu</span>
            <span><i style={{ background: "#e11d48" }} />outro</span>
          </div>
        </div>
      </LiveMap>
      <div className="demo-side">
        <ul className="clean small" style={{ margin: 0 }}>
          <li><I>["get", "campo"]</I> lê um atributo da feature.</li>
          <li><I>["match", …]</I> escolhe um valor por categoria.</li>
          <li><I>["interpolate", …]</I> varia suavemente com o zoom.</li>
          <li><I>filter</I> decide quais features entram na camada.</li>
        </ul>
        <CodeTabs
          extraFirst
          extra={{
            file: "estilo.json",
            code: styleJson,
            marks: markLines(styleJson, last),
            note: f.expr || !interp
              ? `Agora: ${f.expr ? `filter "${f.label}"` : "sem filter"} · line-width ${interp ? "interpolate" : "fixo 2"}`
              : "match (cor) · interpolate (raio e largura) · filter (quais pontos)",
          }}
          app={{ file: "App.tsx", code: appCode }}
          web={{ file: "mapa.js", code: webCode }}
        />
      </div>
    </div>
  );
}

/* ---------- Playground do Style JSON ---------- */
type Json = Record<string, unknown>;
type Opt = { label: string; value: unknown };
type Control = { name: string; layer: string; group: "paint" | "layout"; prop: string; options: Opt[]; fallback?: unknown; state: string; ltype: string; ts?: string };

const CONTROLS: Control[] = [
  { name: "água", layer: "agua", group: "paint", prop: "fill-color", state: "corAgua", ltype: "fill", options: [
    { label: "azul", value: "#9ec7e8" }, { label: "rosa", value: "#ff00aa" },
    { label: "verde", value: "#2dd4bf" }, { label: "noite", value: "#1e3a5f" },
  ] },
  { name: "fundo", layer: "fundo", group: "paint", prop: "background-color", state: "corFundo", ltype: "background", options: [
    { label: "creme", value: "#ebe5da" }, { label: "branco", value: "#ffffff" }, { label: "escuro", value: "#111827" },
  ] },
  { name: "ruas", layer: "ruas", group: "paint", prop: "line-color", state: "corRuas", ltype: "line", options: [
    { label: "branco", value: "#ffffff" }, { label: "laranja", value: "#f97316" }, { label: "amarelo", value: "#facc15" },
  ] },
  { name: "largura", layer: "ruas", group: "paint", prop: "line-width", state: "largura", ltype: "line", ts: "Largura", options: [
    { label: "zoom fino", value: ["interpolate", ["linear"], ["zoom"], 10, 0.5, 18, 14] },
    { label: "zoom grosso", value: ["interpolate", ["linear"], ["zoom"], 10, 2, 18, 28] },
    { label: "fixa 3px", value: 3 },
  ] },
  { name: "prédios", layer: "predios", group: "layout", prop: "visibility", fallback: "visible", state: "visibilidade", ltype: "fill", ts: '"visible" | "none"', options: [
    { label: "visible", value: "visible" }, { label: "none", value: "none" },
  ] },
];

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** Código de componente que usa o style.json e muda a propriedade do controle `c` para `value`. */
function componentCode(c: Control, value: unknown) {
  const v = print(value, 0, true);
  const label = c.options.find((o) => same(o.value, value))?.label ?? "novo valor";
  const typeLine = c.ts === "Largura"
    ? `type Largura = NonNullable<LineLayerSpecification["paint"]>["line-width"];\n\n`
    : "";
  const generic = c.ts ? `<${c.ts}>` : "";
  const setter = "set" + c.state[0].toUpperCase() + c.state.slice(1);
  const app = `import { useState } from "react";
import { Button, View } from "react-native";
import {
  Map, Camera, type StyleSpecification${c.ts === "Largura" ? ", type LineLayerSpecification" : ""},
} from "@maplibre/maplibre-react-native";
import estilo from "./style.json"; // o JSON da aba style.json

type Camada = StyleSpecification["layers"][number];
${typeLine}export default function App() {
  // O valor que muda vira estado do React
  const [${c.state}, ${setter}] = useState${generic}(${v});

  // Novo objeto de estilo a cada mudança → o <Map> redesenha
  const base = estilo as StyleSpecification;
  const mapStyle: StyleSpecification = {
    ...base,
    layers: base.layers.map((camada): Camada =>
      camada.id === "${c.layer}" && camada.type === "${c.ltype}"
        ? { ...camada, ${c.group}: { ...camada.${c.group}, "${c.prop}": ${c.state} } }
        : camada),
  };

  return (
    <View style={{ flex: 1 }}>
      <Map style={{ flex: 1 }} mapStyle={mapStyle}>
        <Camera initialViewState={{ center: [${CARAGUA.join(", ")}], zoom: 14 }} />
      </Map>
      <Button title="${c.name}: ${label}"
        onPress={() => ${setter}(${v})} />
    </View>
  );
}`;
  const web = `import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import estilo from "./style.json"; // o JSON da aba style.json

// O objeto vai direto na opção style (em vez de uma URL)
const map = new maplibregl.Map({
  container: "map",
  style: estilo,
  center: [${CARAGUA.join(", ")}],
  zoom: 14,
});

// O botão "${c.name}: ${label}" muda só uma propriedade,
// sem recriar o estilo inteiro:
map.set${c.group === "paint" ? "Paint" : "Layout"}Property("${c.layer}", "${c.prop}", ${v});

// Ou trocar o estilo todo de uma vez (ex.: depois de editar o JSON)
map.setStyle(estilo, { diff: true });`;
  return { app, web };
}
const findLayer = (style: Json, id: string) => (style.layers as Json[] | undefined)?.find((l) => l.id === id);

function Playground() {
  const [text, setText] = useState(() => print(PLAYGROUND_STYLE, 0, true));
  const [error, setError] = useState<string | null>(null);
  const [changed, setChanged] = useState<string | null>(null);
  const [tab, setTab] = useState<"json" | "app" | "web">("json");
  const [lastCtl, setLastCtl] = useState<Control>(CONTROLS[0]);
  // Faixa de destaque: linha inicial, quantidade de linhas e uma chave para reiniciar a animação
  const [mark, setMark] = useState<{ line: number; count: number; key: number } | null>(null);
  const [scroll, setScroll] = useState(0);
  const [lineH, setLineH] = useState(20);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const obj = JSON.parse(text);
        mapRef.current?.setStyle(obj, { diff: true });
        setError(null);
      } catch (e) {
        setError((e as Error).message);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [text]);

  // Estado atual lido do próprio JSON (assim, editar à mão também atualiza os botões)
  let parsed: Json | null = null;
  try { parsed = JSON.parse(text); } catch { /* JSON inválido: botões ficam sem seleção */ }
  const current = (c: Control) => {
    const layer = parsed && findLayer(parsed, c.layer);
    const group = layer?.[c.group] as Json | undefined;
    return group?.[c.prop] ?? c.fallback;
  };

  const apply = (c: Control, value: unknown) => {
    if (!parsed) return;
    const style = structuredClone(parsed);
    const layer = findLayer(style, c.layer);
    if (!layer) return;
    layer[c.group] = { ...(layer[c.group] as Json | undefined), [c.prop]: value };
    const next = print(style, 0, true);
    setText(next);
    setChanged(`layers › ${c.layer} › ${c.group} › ${c.prop}`);
    setLastCtl(c);
    // Destaca e rola até a linha alterada (sem tirar o foco das setas do slide)
    const start = next.indexOf(`"id": "${c.layer}"`);
    const at = next.indexOf(`"${c.prop}"`, start);
    const line = next.slice(0, at).split("\n").length - 1;
    const count = print(value, 4, true).split("\n").length;
    setMark({ line, count, key: Date.now() });
    requestAnimationFrame(() => {
      const ed = editorRef.current;
      if (!ed) return;
      const lh = parseFloat(getComputedStyle(ed).lineHeight) || 20;
      setLineH(lh);
      ed.scrollTop = Math.max(0, (line - 4) * lh);
      setScroll(ed.scrollTop);
    });
  };

  return (
    <div className="demo-grid">
      <LiveMap
        badge={<><FileJson /> Style JSON escrito à mão · 5 camadas</>}
        options={{ style: PLAYGROUND_STYLE, center: CARAGUA, zoom: 14 }}
        setup={(m) => { mapRef.current = m; return () => { mapRef.current = null; }; }}
      >
        <div className="cam-panel">
          {CONTROLS.map((c) => (
            <div key={c.name} className="cam-row">
              <code>{c.name}</code>
              {c.options.map((o) => (
                <button key={o.label} className={same(current(c), o.value) ? "on" : ""} onClick={() => apply(c, o.value)}>
                  {typeof o.value === "string" && o.value.startsWith("#") && <i className="swatch" style={{ background: o.value }} />}
                  {o.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </LiveMap>
      <div className="demo-side">
        <p className="demo-purpose">
          Clique nas opções sobre o mapa ou edite o JSON à mão. As abas App e Web mostram como usar este estilo em um componente.
        </p>
        <div className="code">
          <div className="code-bar">
            <button className={`tab ${tab === "json" ? "on" : ""}`} onClick={() => setTab("json")}><Braces /> style.json</button>
            <button className={`tab ${tab === "app" ? "on" : ""}`} onClick={() => setTab("app")}><Smartphone /> App (Android/iOS)</button>
            <button className={`tab ${tab === "web" ? "on" : ""}`} onClick={() => setTab("web")}><Globe /> Web</button>
            <span className="file">{tab === "json" ? "editável" : tab === "app" ? "App.tsx" : "mapa.js"}</span>
          </div>
          {tab !== "json" && <Highlight code={componentCode(lastCtl, current(lastCtl))[tab]} lang="typescript" />}
          <div className="editor-wrap" style={tab === "json" ? undefined : { display: "none" }}>
            {mark && (
              <div
                key={mark.key}
                className="line-mark"
                style={{ top: `calc(1rem + ${mark.line * lineH - scroll}px)`, height: mark.count * lineH }}
              />
            )}
            <textarea
              ref={editorRef}
              className="editor"
              spellCheck={false}
              wrap="off"
              value={text}
              onScroll={(e) => setScroll(e.currentTarget.scrollTop)}
              onChange={(e) => { setText(e.target.value); setChanged(null); setMark(null); }}
              onKeyDown={(e) => {
                if (e.key === "Tab") { e.preventDefault(); document.execCommand("insertText", false, "  "); }
              }}
            />
          </div>
          {tab === "json" && <div className={`status ${error ? "err" : ""}`}>
            {error ? <><CircleX /> JSON inválido: {error}</>
              : changed ? <><CircleCheck /> Alterado: {changed}</>
              : <><CircleCheck /> Estilo válido — mapa atualizado</>}
          </div>}
        </div>
      </div>
    </div>
  );
}

export const styleSlides: SlideDef[] = [
  {
    section: "Style JSON",
    variant: "section",
    notes: "Agora que vimos os mapas funcionando, abrimos o capô: o JSON que descreve cada um deles.",
    Body: () => (
      <>
        <div className="num">06</div>
        <h2>Style JSON: a receita do mapa</h2>
        <p>Fontes, camadas e expressões — o arquivo que define a aparência de todos os mapas que vimos.</p>
      </>
    ),
  },
  {
    section: "Style JSON",
    notes: "A pilha de camadas é como camadas do Photoshop. Próximo slide: vamos montar um estilo do zero e editá-lo ao vivo.",
    Body: () => (
      <>
        <Kicker Icon={FileJson}>Style JSON · 1 de 3</Kicker>
        <h2>O Style JSON: a receita do mapa</h2>
        <div className="cols-2 grow">
          <div>
            <div className="flow col">
              <div className="step"><b><Database /> sources</b>De onde vêm os dados: <I>vector</I>, <I>raster</I>, <I>raster-dem</I>, <I>geojson</I>, <I>image</I></div>
              <div className="step"><b><Layers /> layers</b>Como desenhar, em ordem (a primeira fica embaixo): <I>fill</I>, <I>line</I>, <I>symbol</I>, <I>circle</I>, <I>fill-extrusion</I>, <I>raster</I>, <I>hillshade</I>, <I>heatmap</I>, <I>background</I></div>
              <div className="step"><b><Type /> glyphs · sprite</b>Fontes para os textos e a folha de ícones (lojas, ônibus, hospitais…)</div>
            </div>
            <p className="small muted mt-s">Um estilo como o <b>Liberty</b> tem 111 camadas. Trocar o estilo = trocar a aparência inteira, sem mudar uma linha da lógica do app.</p>
          </div>
          <div className="layer-stack">
            <div style={{ background: "#334155" }}><Type /> symbol — nomes de ruas e ícones de lojas</div>
            <div style={{ background: "#1e3a8a" }}><Box /> fill-extrusion — prédios 3D</div>
            <div style={{ background: "#2563eb" }}><PenTool /> line — ruas e avenidas</div>
            <div style={{ background: "#0d9488" }}><Waves /> fill — água e parques</div>
            <div style={{ background: "#94a3b8" }}><Paintbrush /> background — cor de fundo</div>
            <p className="tiny muted" style={{ margin: ".4rem 0 0", textAlign: "center" }}>↑ desenhado por último · ↓ desenhado primeiro</p>
          </div>
        </div>
      </>
    ),
  },
  {
    section: "Style JSON",
    notes: "Demonstração ao vivo: clique em água → rosa e veja o JSON rolar até fill-color; depois largura → zoom grosso e prédios → none (layout.visibility). Também dá para editar o texto à mão. Depois abra a aba App: o estado do React gera um novo objeto de estilo; na aba Web, setPaintProperty muda só a propriedade. Os dados (vector tiles da OpenFreeMap) são os mesmos; só o estilo muda. Este mesmo objeto poderia ir em mapStyle={...} no app.",
    Body: () => (
      <>
        <Kicker Icon={PenTool}>Style JSON · 2 de 3 · ao vivo</Kicker>
        <h2 style={{ marginBottom: "1rem" }}>Seu primeiro estilo, do zero</h2>
        <Playground />
      </>
    ),
  },
  {
    section: "Style JSON",
    notes: "Dê zoom e veja as ruas engrossarem (interpolate) — o número no canto mostra a largura calculada. Use os filtros: o filter decide quais pontos entram na camada. A cor de cada ponto vem do match sobre o atributo tipo. A aba estilo.json mostra só a configuração, mudando com os botões; App e Web mostram o componente. Tudo isso funciona igual no app (paint/filter do <Layer>).",
    Body: () => (
      <>
        <Kicker Icon={Braces}>Style JSON · 3 de 3 · ao vivo</Kicker>
        <h2 style={{ marginBottom: "1rem" }}>Expressões: estilo guiado pelos dados</h2>
        <ExpressionsDemo />
      </>
    ),
  },
];
