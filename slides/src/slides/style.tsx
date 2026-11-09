import { useEffect, useRef, useState } from "react";
import type maplibregl from "maplibre-gl";
import {
  Box, Braces, CircleCheck, CircleX, Database, FileJson, Info, Layers, Paintbrush, PenTool, Type, Waves,
} from "lucide-react";
import { CodePanel } from "../components/Code";
import { LiveMap } from "../components/LiveMap";
import { Callout, I, Kicker } from "../components/ui";
import { CARAGUA, PLAYGROUND_STYLE, print } from "../data/demos";
import type { SlideDef } from "../deck/Deck";

/* ---------- Playground do Style JSON ---------- */
function Playground() {
  const [text, setText] = useState(() => print(PLAYGROUND_STYLE, 0, true));
  const [error, setError] = useState<string | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

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

  return (
    <div className="demo-grid">
      <LiveMap
        badge={<><FileJson /> Style JSON escrito à mão · 5 camadas</>}
        options={{ style: PLAYGROUND_STYLE, center: CARAGUA, zoom: 14 }}
        setup={(m) => { mapRef.current = m; return () => { mapRef.current = null; }; }}
      />
      <div className="demo-side">
        <p className="demo-purpose">
          Experimente: troque <I>#9ec7e8</I> (água) por <I>#ff00aa</I>, ou mude <I>line-width</I>. O mapa atualiza a cada tecla.
        </p>
        <div className="code">
          <div className="code-bar">
            <span className="tab on static"><Braces /> style.json</span>
            <span className="file">mesmo JSON no app e na web</span>
          </div>
          <textarea
            className="editor"
            spellCheck={false}
            wrap="off"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Tab") { e.preventDefault(); document.execCommand("insertText", false, "  "); }
            }}
          />
          <div className={`status ${error ? "err" : ""}`}>
            {error ? <><CircleX /> JSON inválido: {error}</> : <><CircleCheck /> Estilo válido — mapa atualizado</>}
          </div>
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
            <div style={{ background: "#0f172a" }}><Type /> symbol — nomes de ruas e ícones de lojas</div>
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
    notes: "Demonstração ao vivo: mude a cor da água para rosa e a largura das ruas. Os dados (vector tiles da OpenFreeMap) são os mesmos; só o estilo muda. Este mesmo objeto poderia ir em mapStyle={...} no app.",
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
    notes: "É esse match por tipo que pinta as praias de azul na demo de GeoJSON de Caraguatatuba.",
    Body: () => (
      <>
        <Kicker Icon={Braces}>Style JSON · 3 de 3</Kicker>
        <h2>Expressões: estilo guiado pelos dados</h2>
        <div className="cols-2 grow">
          <div>
            <ul className="clean">
              <li><I>["get", "campo"]</I> lê um atributo da feature.</li>
              <li><I>["match", …]</I> escolhe um valor por categoria.</li>
              <li><I>["interpolate", …]</I> varia suavemente com o zoom ou um número.</li>
              <li><I>filter</I> decide quais features entram na camada.</li>
            </ul>
            <Callout Icon={Info} className="mt-s">As expressões são avaliadas para cada feature, a cada quadro — funcionam igual na web e no celular.</Callout>
          </div>
          <CodePanel title="expressões" icon={<Braces />} blocks={[{ lang: "typescript", code: `// Cor do círculo conforme a categoria do ponto
"circle-color": [
  "match", ["get", "tipo"],
  "praia",   "#0284c7",
  "mirante", "#16a34a",
  "#e11d48"            // valor padrão
],

// Largura da rua cresce com o zoom
"line-width": [
  "interpolate", ["linear"], ["zoom"],
  10, 0.5,             // no zoom 10 → 0,5 px
  18, 14               // no zoom 18 → 14 px
],

// Mostrar só os POIs de comércio
"filter": ["==", ["get", "class"], "shop"]` }]} />
        </div>
      </>
    ),
  },
];
