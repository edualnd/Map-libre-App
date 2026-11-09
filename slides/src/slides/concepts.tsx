import { useEffect, useRef, useState } from "react";
import type maplibregl from "maplibre-gl";
import {
  Box, Braces, CircleCheck, CircleX, Database, FileJson, Grid3x3, Image, Info, Layers, Mountain, Paintbrush,
  PenTool, Shapes, Type, TriangleAlert, Waves,
} from "lucide-react";
import { CodePanel, Highlight } from "../components/Code";
import { LiveMap } from "../components/LiveMap";
import { Callout, I, Kicker, No, Tag, WithIcon, Yes } from "../components/ui";
import { OFM, PLAYGROUND_STYLE, print } from "../data/demos";
import type { SlideDef } from "../deck/Deck";

/* ---------- Pirâmide de tiles ---------- */
function Grid({ n, size, hit }: { n: number; size: number; hit: number }) {
  return (
    <div className="grid" style={{ gridTemplateColumns: `repeat(${n}, ${size}rem)` }}>
      {Array.from({ length: n * n }, (_, i) => (
        <span key={i} className={i === hit ? "hit" : ""} style={{ height: `${size}rem` }} />
      ))}
    </div>
  );
}

const TILE_URL = "https://tile.opentopomap.org/14/6058/9295.png";
function tileAnnotation() {
  const z = TILE_URL.indexOf("14"), x = TILE_URL.indexOf("6058"), y = TILE_URL.indexOf("9295");
  const row = (marks: [number, string][]) => {
    const line = Array(60).fill(" ");
    for (const [col, txt] of marks) [...txt].forEach((ch, i) => (line[col + i] = ch));
    return line.join("").trimEnd();
  };
  return [
    TILE_URL,
    row([[z, "│"], [x, "│"], [y, "└─ linha (y)"]]),
    row([[z, "│"], [x, "└─ coluna (x)"]]),
    row([[z, "└─ zoom (z)"]]),
  ].join("\n");
}

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
        options={{ style: PLAYGROUND_STYLE, center: [-46.656, -23.585], zoom: 14.2 }}
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

export const conceptSlides: SlideDef[] = [
  {
    section: "Como funciona",
    variant: "section",
    notes: "Parte conceitual — sem isso as demos parecem mágica.",
    Body: () => (
      <>
        <div className="num">02</div>
        <h2>Como um mapa digital funciona</h2>
        <p>Tiles, fontes de dados, camadas e o Style JSON — os quatro conceitos que explicam tudo o que vem depois.</p>
      </>
    ),
  },
  {
    section: "Como funciona",
    notes: "4^18 ≈ 68,7 bilhões de tiles: ninguém baixa tudo, só a janela visível. No mapa à direita, as linhas vermelhas são os limites reais dos tiles — dê zoom e veja cada quadrado se dividir em 4.",
    Body: () => (
      <>
        <Kicker Icon={Grid3x3}>Conceito 1</Kicker>
        <h2>O mundo é dividido em tiles (ladrilhos)</h2>
        <div className="cols-2 grow">
          <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", minHeight: 0 }}>
            <div className="pyramid">
              <div className="pyr"><Grid n={1} size={3.4} hit={0} />z = 0<br /><b>1</b> tile</div>
              <div className="pyr"><Grid n={2} size={2.4} hit={2} />z = 1<br /><b>4</b> tiles</div>
              <div className="pyr"><Grid n={4} size={1.3} hit={9} />z = 2<br /><b>16</b> tiles</div>
              <div className="pyr" style={{ fontSize: "2rem", color: "var(--accent)", alignSelf: "center" }}>…</div>
              <div className="pyr"><div style={{ fontSize: "2.6rem", fontWeight: 800, color: "var(--ink)" }}>4<sup>z</sup></div>z = 18<br /><b>68 bilhões</b></div>
            </div>
            <ul className="clean">
              <li>A cada nível de <b>zoom</b>, cada tile se divide em 4.</li>
              <li>O app só baixa os tiles <b>visíveis na tela</b> — por isso o mapa carrega rápido.</li>
              <li>Endereço padrão: <I>{"…/{z}/{x}/{y}.png"}</I></li>
            </ul>
            <div className="code"><Highlight code={tileAnnotation()} lang="plaintext" /></div>
          </div>
          <LiveMap
            badge={<><Grid3x3 /> Ao vivo: map.showTileBoundaries = true · dê zoom</>}
            options={{ style: `${OFM}/positron`, center: [-46.6388, -23.5558], zoom: 11 }}
            setup={(m) => { m.showTileBoundaries = true; }}
          />
        </div>
      </>
    ),
  },
  {
    section: "Como funciona",
    notes: "Vetorial é o grande diferencial dos motores modernos. Raster continua útil para imagens (satélite) e para mapas temáticos prontos de projetos da comunidade.",
    Body: () => (
      <>
        <Kicker Icon={Shapes}>Conceito 2</Kicker>
        <h2>Raster × Vetorial</h2>
        <table className="t">
          <thead>
            <tr><th></th><th><WithIcon Icon={Image}>Raster</WithIcon></th><th><WithIcon Icon={PenTool}>Vetorial</WithIcon></th></tr>
          </thead>
          <tbody>
            <tr><td>O que chega</td><td>Imagem pronta (PNG / JPG)</td><td>Geometrias + atributos (formato MVT / PBF)</td></tr>
            <tr><td>Quem desenha</td><td>O servidor</td><td>O <b>seu aparelho</b> (GPU), em tempo real</td></tr>
            <tr><td>Mudar cores</td><td><No>Impossível</No></td><td><Yes>Basta trocar o estilo</Yes></td></tr>
            <tr><td>Girar / inclinar</td><td>Texto gira junto e fica ilegível</td><td>Rótulos sempre de pé, prédios em 3D</td></tr>
            <tr><td>Clicar e consultar</td><td><No>Só pixels</No></td><td><Yes><code>queryRenderedFeatures</code> devolve nome, tipo…</Yes></td></tr>
            <tr><td>Exemplos hoje</td><td>Satélite, Topográfico, Ciclismo, Náutico</td><td>Ruas e Lojas, Minimalista, Noturno, Prédios 3D</td></tr>
          </tbody>
        </table>
        <Callout Icon={Info} tone="amber" className="mt">
          O MapLibre é especialista em <b>vetorial</b>, mas também exibe raster — é assim que conseguimos usar fontes como satélite e mapas temáticos.
        </Callout>
      </>
    ),
  },
  {
    section: "Como funciona",
    notes: "A pilha de camadas é como camadas do Photoshop. Próximo slide: vamos montar um estilo do zero e editá-lo ao vivo.",
    Body: () => (
      <>
        <Kicker Icon={FileJson}>Conceito 3</Kicker>
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
    section: "Como funciona",
    notes: "Demonstração ao vivo: mude a cor da água para rosa e a largura das ruas. Os dados (vector tiles da OpenFreeMap) são os mesmos; só o estilo muda. Este mesmo objeto poderia ir em mapStyle={...} no app.",
    Body: () => (
      <>
        <Kicker Icon={PenTool}>Ao vivo · edite o JSON</Kicker>
        <h2 style={{ marginBottom: "1rem" }}>Seu primeiro estilo, do zero</h2>
        <Playground />
      </>
    ),
  },
  {
    section: "Como funciona",
    notes: "Vamos usar exatamente o match por tipo na demo de GeoJSON mais à frente.",
    Body: () => (
      <>
        <Kicker Icon={Braces}>Conceito 4</Kicker>
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
  "museu",  "#7c3aed",
  "parque", "#16a34a",
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
  {
    section: "Como funciona",
    notes: "Todas as fontes desta tabela aparecem nas demonstrações. Sempre exiba a atribuição — o MapLibre faz isso automaticamente a partir do campo attribution de cada source.",
    Body: () => (
      <>
        <Kicker Icon={Database}>De onde vêm os dados</Kicker>
        <h2>Fontes gratuitas e sem API key</h2>
        <table className="t">
          <thead><tr><th>Fonte</th><th>Tipo</th><th>O que oferece</th><th>Regras de uso</th></tr></thead>
          <tbody>
            <tr><td>OpenFreeMap</td><td><Tag Icon={PenTool}>vetorial</Tag></td><td>Estilos Liberty, Bright, Positron, Dark, Fiord</td><td>Gratuito, sem chave, mantido por doações</td></tr>
            <tr><td>Esri (ArcGIS Online)</td><td><Tag tone="teal" Icon={Image}>raster</Tag></td><td>Satélite, oceanos, National Geographic, cinza</td><td>Atribuição obrigatória; uso leve / não comercial</td></tr>
            <tr><td>OpenTopoMap · CyclOSM · HOT</td><td><Tag tone="teal" Icon={Image}>raster</Tag></td><td>Topográfico, ciclismo, humanitário</td><td>Servidores comunitários — uso moderado</td></tr>
            <tr><td>OpenRailwayMap · OpenSeaMap</td><td><Tag tone="teal" Icon={Image}>raster</Tag></td><td>Overlays de ferrovias e sinalização náutica</td><td>Servidores comunitários — uso moderado</td></tr>
            <tr><td>AWS Terrain Tiles</td><td><Tag tone="amber" Icon={Mountain}>raster-dem</Tag></td><td>Elevação do planeta (formato Terrarium)</td><td>Open Data na AWS</td></tr>
          </tbody>
        </table>
        <Callout Icon={TriangleAlert} tone="rose" className="mt">
          Servidores comunitários são ótimos para estudo e protótipos. Para um app publicado com muitos usuários, hospede seus tiles (ex.: <b>PMTiles</b> + Martin) ou contrate um provedor.
        </Callout>
      </>
    ),
  },
];
