import type { StyleSpecification } from "maplibre-gl";
import {
  Bike, Building2, Bus, Mountain,
  MountainSnow, Satellite, Store, TrainFront, type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Fontes e helpers — iguais aos de mapModes.ts no app                 */
/* ------------------------------------------------------------------ */
export const OFM = "https://tiles.openfreemap.org/styles";
/** Posição inicial de todos os mapas: centro de Caraguatatuba (Praça Cândido Mota). */
export const CARAGUA: [number, number] = [-45.411, -23.622];
export const ESRI = "https://server.arcgisonline.com/ArcGIS/rest/services";
const OSM = "© OpenStreetMap contributors";
export const GLYPHS = "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf";
const abc = (tpl: string, subs = ["a", "b", "c"]) => subs.map((s) => tpl.replace("{s}", s));

export type RasterLayer = { id: string; tiles: string[]; attribution: string; maxzoom?: number; tileSize?: number };

export function rasterStyle(layers: RasterLayer[]): StyleSpecification {
  const sources: StyleSpecification["sources"] = {};
  for (const l of layers) {
    sources[l.id] = { type: "raster", tiles: l.tiles, tileSize: l.tileSize ?? 256, maxzoom: l.maxzoom ?? 19, attribution: l.attribution };
  }
  return {
    version: 8,
    glyphs: GLYPHS,
    sources,
    layers: [
      { id: "bg", type: "background", paint: { "background-color": "#e8e8e8" } },
      ...layers.map((l) => ({ id: l.id, type: "raster" as const, source: l.id })),
    ],
  };
}

export const RASTER_HELPER = `// mapModes.ts — monta um Style JSON a partir de camadas raster
export function rasterStyle(layers: RasterLayer[]): StyleSpecification {
  const sources: StyleSpecification["sources"] = {};
  for (const l of layers) {
    sources[l.id] = {
      type: "raster", tiles: l.tiles, tileSize: l.tileSize ?? 256,
      maxzoom: l.maxzoom ?? 19, attribution: l.attribution,
    };
  }
  return {
    version: 8, glyphs: GLYPHS, sources,
    layers: [
      { id: "bg", type: "background", paint: { "background-color": "#e8e8e8" } },
      ...layers.map((l) => ({ id: l.id, type: "raster" as const, source: l.id })),
    ],
  };
}`;

const RELIEF_STYLE: StyleSpecification = {
  version: 8,
  glyphs: GLYPHS,
  sources: {
    dem: {
      type: "raster-dem",
      tiles: ["https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"],
      encoding: "terrarium",
      tileSize: 256,
      maxzoom: 15,
      attribution: "Elevação: Mapzen / AWS Terrain Tiles",
    },
    labels: {
      type: "raster",
      tiles: [`${ESRI}/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}`],
      tileSize: 256,
      attribution: "© Esri",
    },
  },
  layers: [
    { id: "bg", type: "background", paint: { "background-color": "#f4f1ea" } },
    {
      id: "hillshade",
      type: "hillshade",
      source: "dem",
      paint: {
        "hillshade-exaggeration": 0.8,
        "hillshade-shadow-color": "#473B24",
        "hillshade-highlight-color": "#ffffff",
      },
    },
    { id: "labels", type: "raster", source: "labels" },
  ],
};

/**
 * Estilo próprio de transporte sobre os tiles vetoriais do OpenFreeMap.
 * Substitui o ÖPNVKarte, cujo servidor não envia CORS e não abre no navegador.
 */
const TRANSIT_STYLE: StyleSpecification = {
  version: 8,
  glyphs: GLYPHS,
  sources: {
    omt: { type: "vector", url: "https://tiles.openfreemap.org/planet" },
  },
  layers: [
    { id: "fundo", type: "background", paint: { "background-color": "#eef0f2" } },
    { id: "agua", type: "fill", source: "omt", "source-layer": "water", paint: { "fill-color": "#b9d3e8" } },
    { id: "predios", type: "fill", source: "omt", "source-layer": "building", minzoom: 14, paint: { "fill-color": "#e0e2e6" } },
    {
      id: "ruas", type: "line", source: "omt", "source-layer": "transportation",
      filter: ["in", ["get", "class"], ["literal", ["motorway", "trunk", "primary", "secondary", "tertiary", "minor", "service"]]],
      paint: { "line-color": "#ffffff", "line-width": ["interpolate", ["linear"], ["zoom"], 10, 0.5, 18, 12] },
    },
    {
      id: "balsas", type: "line", source: "omt", "source-layer": "transportation",
      filter: ["==", ["get", "class"], "ferry"],
      paint: { "line-color": "#2563eb", "line-width": 2.5, "line-dasharray": [2, 1.5] },
    },
    {
      id: "trilhos", type: "line", source: "omt", "source-layer": "transportation",
      filter: ["in", ["get", "class"], ["literal", ["rail", "transit"]]],
      paint: { "line-color": "#b91c1c", "line-width": 3 },
    },
    {
      id: "pontos-onibus", type: "circle", source: "omt", "source-layer": "poi",
      filter: ["==", ["get", "subclass"], "bus_stop"],
      paint: { "circle-color": "#0d9488", "circle-radius": 6, "circle-stroke-color": "#ffffff", "circle-stroke-width": 2 },
    },
    {
      id: "estacoes", type: "circle", source: "omt", "source-layer": "poi",
      filter: ["in", ["get", "subclass"], ["literal", ["bus_station", "station", "halt", "ferry_terminal"]]],
      paint: { "circle-color": "#7c3aed", "circle-radius": 8, "circle-stroke-color": "#ffffff", "circle-stroke-width": 2.5 },
    },
    {
      id: "bairros", type: "symbol", source: "omt", "source-layer": "place",
      layout: { "text-field": ["get", "name"], "text-font": ["Noto Sans Regular"], "text-size": 12, "text-transform": "uppercase" },
      paint: { "text-color": "#8a94a6", "text-halo-color": "#ffffff", "text-halo-width": 1 },
    },
    {
      id: "nomes-estacoes", type: "symbol", source: "omt", "source-layer": "poi",
      filter: ["in", ["get", "subclass"], ["literal", ["bus_station", "station", "halt", "ferry_terminal"]]],
      layout: { "text-field": ["get", "name"], "text-font": ["Noto Sans Bold"], "text-size": 13, "text-offset": [0, 1.3], "text-anchor": "top" },
      paint: { "text-color": "#4c1d95", "text-halo-color": "#ffffff", "text-halo-width": 1.5 },
    },
  ],
};

/* ------------------------------------------------------------------ */
/* As demonstrações: vetorial → elevação → raster                     */
/* ------------------------------------------------------------------ */
export type Kind = "vetorial" | "raster" | "raster-dem";
export type DemoStyle = { url: string } | { raster: RasterLayer[] } | { object: StyleSpecification };
export type View = { center: [number, number]; zoom: number; pitch?: number; bearing?: number };

export type Demo = {
  id: string;
  label: string;
  Icon: LucideIcon;
  kind: Kind;
  source: string;
  purpose: string;
  bullets: string[]; // HTML simples (b, code)
  style: DemoStyle;
  view: View;
  notes: string;
};

export const DEMOS: Demo[] = [
  {
    id: "streets", label: "Ruas e Lojas", Icon: Store, kind: "vetorial", source: "OpenFreeMap · Liberty",
    purpose: "Navegação urbana: ruas, números, comércio, restaurantes e pontos de interesse.",
    bullets: [
      "Tiles <b>vetoriais</b>: textos e ícones são desenhados no aparelho — nítidos em qualquer zoom.",
      "A camada <code class='i'>poi</code> traz lojas, farmácias, bancos, restaurantes…",
      "A mesma URL funciona no app e na web, sem API key.",
    ],
    style: { url: `${OFM}/liberty` },
    view: { center: CARAGUA, zoom: 16 },
    notes: "Centro de Caraguatatuba. Dê zoom e mostre os ícones de comércio e os números das casas — tudo vem dos dados do OpenStreetMap.",
  },
  {
    id: "buildings3d", label: "Prédios 3D", Icon: Building2, kind: "vetorial", source: "OpenFreeMap · Liberty + pitch",
    purpose: "Visualização urbana em perspectiva: altura real dos edifícios com a câmera inclinada.",
    bullets: [
      "Camada <code class='i'>fill-extrusion</code> usa a altura dos prédios cadastrada no OSM.",
      "<code class='i'>pitch</code> inclina a câmera; <code class='i'>bearing</code> gira.",
      "Na tela: botão direito + arrastar (web) ou dois dedos (app) para girar.",
    ],
    style: { url: `${OFM}/liberty` },
    view: { center: CARAGUA, zoom: 16.5, pitch: 60, bearing: -30 },
    notes: "Centro de Caraguatatuba em perspectiva. Gire com o botão direito do mouse. Onde o OSM não tem altura cadastrada, o prédio usa uma altura padrão — mais um motivo para contribuir com o mapa.",
  },
  {
    id: "transit", label: "Transporte", Icon: Bus, kind: "vetorial", source: "OpenFreeMap · estilo próprio",
    purpose: "Mobilidade urbana: pontos de ônibus, rodoviária, terminais de balsa e trilhos.",
    bullets: [
      "Estilo <b>próprio</b> sobre os tiles vetoriais do OpenFreeMap: só água, ruas e o que é transporte.",
      "Pontos e estações vêm da camada <code class='i'>poi</code>, filtrados por <code class='i'>subclass</code> (<code class='i'>bus_stop</code>, <code class='i'>bus_station</code>…).",
      "Balsas e trilhos vêm da camada <code class='i'>transportation</code>. O mesmo estilo funciona no app e na web.",
    ],
    style: { object: TRANSIT_STYLE },
    view: { center: [-45.42, -23.625], zoom: 14 },
    notes: "Mostre que o estilo é um objeto escrito à mão: cada camada é um filtro sobre os mesmos tiles vetoriais. Pontos verdes = pontos de ônibus; roxo = rodoviária, estações e terminais de balsa (afaste o zoom até São Sebastião para ver a balsa de Ilhabela).",
  },
  {
    id: "relief", label: "Relevo", Icon: MountainSnow, kind: "raster-dem", source: "AWS Terrain Tiles + hillshade",
    purpose: "Entender o terreno: serras, vales e morros sombreados a partir de dados de elevação.",
    bullets: [
      "Fonte <code class='i'>raster-dem</code>: cada pixel guarda uma altitude (Terrarium).",
      "A camada <code class='i'>hillshade</code> calcula as sombras <b>no aparelho</b> — cor e intensidade são editáveis.",
      "Na web dá para ir além: <code class='i'>map.setTerrain()</code> cria relevo 3D.",
    ],
    style: { object: RELIEF_STYLE },
    view: { center: CARAGUA, zoom: 10.5 },
    notes: "Caraguatatuba entre o mar e a Serra do Mar: veja a serra a oeste e a Ilhabela ao sul. Os dados são raster, mas o sombreado é calculado na GPU.",
  },
  {
    id: "satellite", label: "Satélite", Icon: Satellite, kind: "raster", source: "Esri World Imagery",
    purpose: "Ver o terreno real: telhados, vegetação, praias — com ruas e nomes por cima.",
    bullets: [
      "Três camadas <b>raster</b> empilhadas: imagem → ruas → rótulos.",
      "Raster é imagem pronta: não dá para mudar cores nem consultar POIs.",
      "Atribuição da Esri é obrigatória (o MapLibre exibe sozinho).",
    ],
    style: {
      raster: [
        { id: "imagery", tiles: [`${ESRI}/World_Imagery/MapServer/tile/{z}/{y}/{x}`], attribution: "© Esri, Maxar, Earthstar Geographics" },
        { id: "roads", tiles: [`${ESRI}/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}`], attribution: "© Esri" },
        { id: "labels", tiles: [`${ESRI}/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}`], attribution: "© Esri" },
      ],
    },
    view: { center: CARAGUA, zoom: 14 },
    notes: "Caraguatatuba vista de cima: a orla, o Morro Santo Antônio e a mata da serra. Estilo montado à mão com rasterStyle().",
  },
  {
    id: "topo", label: "Topográfico", Icon: Mountain, kind: "raster", source: "OpenTopoMap",
    purpose: "Trilhas, montanhismo e engenharia: curvas de nível, altitudes e caminhos.",
    bullets: [
      "<code class='i'>maxzoom: 17</code>: acima disso o MapLibre amplia o último nível (overzoom).",
      "Subdomínios <code class='i'>a/b/c</code> distribuem as requisições.",
      "Dados do OSM + elevação SRTM.",
    ],
    style: {
      raster: [
        { id: "opentopo", tiles: abc("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png"), attribution: `${OSM}, SRTM | © OpenTopoMap (CC-BY-SA)`, maxzoom: 17 },
      ],
    },
    view: { center: CARAGUA, zoom: 12.5 },
    notes: "Curvas de nível da Serra do Mar logo atrás da cidade — a diferença de altitude é enorme em poucos quilômetros.",
  },
  {
    id: "cycling", label: "Ciclismo", Icon: Bike, kind: "raster", source: "CyclOSM",
    purpose: "Planejar pedaladas: ciclovias, ciclofaixas, bicicletários e oficinas.",
    bullets: [
      "Gerado a partir das tags do OSM (<code class='i'>cycleway=*</code>).",
      "Cores indicam o tipo de infraestrutura cicloviária.",
      "Contribuir no OpenStreetMap melhora este mapa para todos.",
    ],
    style: {
      raster: [
        { id: "cyclosm", tiles: abc("https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png"), attribution: `${OSM} | CyclOSM`, maxzoom: 20 },
      ],
    },
    view: { center: CARAGUA, zoom: 14.5 },
    notes: "Orla de Caraguatatuba: mostre as ciclovias da avenida da praia.",
  },
  {
    id: "railway", label: "Ferrovias", Icon: TrainFront, kind: "raster", source: "Esri Light Gray + OpenRailwayMap",
    purpose: "Infraestrutura ferroviária: trilhos, estações, linhas de metrô e trem.",
    bullets: [
      "<b>Overlay</b> transparente sobre uma base neutra.",
      "Ordem das camadas = ordem de desenho: a base primeiro.",
      "O fundo cinza faz as linhas coloridas se destacarem.",
    ],
    style: {
      raster: [
        { id: "gray", tiles: [`${ESRI}/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}`], attribution: "© Esri, HERE, Garmin", maxzoom: 16 },
        { id: "orm", tiles: abc("https://{s}.tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"), attribution: `${OSM} | © OpenRailwayMap (CC-BY-SA)`, maxzoom: 19 },
      ],
    },
    view: { center: CARAGUA, zoom: 9 },
    notes: "Caraguatatuba não tem trem: o zoom inicial é baixo para mostrar a ferrovia do Vale do Paraíba (São José dos Campos) ao norte, do outro lado da serra.",
  },
];

export function toRuntimeStyle(style: DemoStyle): string | StyleSpecification {
  if ("url" in style) return style.url;
  if ("raster" in style) return rasterStyle(style.raster);
  return style.object;
}

/* ------------------------------------------------------------------ */
/* Geração do código exibido — a partir dos mesmos dados do mapa       */
/* ------------------------------------------------------------------ */
export function print(v: unknown, ind = 0, json = false, ctx = { esri: false }): string {
  const pad = "  ".repeat(ind), pad1 = "  ".repeat(ind + 1);
  if (typeof v === "string") {
    if (!json && v.startsWith(ESRI)) { ctx.esri = true; return "`${ESRI}" + v.slice(ESRI.length) + "`"; }
    return JSON.stringify(v);
  }
  if (typeof v !== "object" || v === null) return String(v);
  if (Array.isArray(v)) {
    const items = v.map((x) => print(x, ind + 1, json, ctx));
    const one = "[" + items.join(", ") + "]";
    if (one.length + ind * 2 < 72 && !one.includes("\n")) return one;
    return "[\n" + items.map((i) => pad1 + i).join(",\n") + (json ? "\n" : ",\n") + pad + "]";
  }
  const ents = Object.entries(v as Record<string, unknown>).map(([k, x]) =>
    (!json && /^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)) + ": " + print(x, ind + 1, json, ctx));
  const one = "{ " + ents.join(", ") + " }";
  if (one.length + ind * 2 < 72 && !one.includes("\n")) return one;
  return "{\n" + ents.map((e) => pad1 + e).join(",\n") + (json ? "\n" : ",\n") + pad + "}";
}

function styleExpr(style: DemoStyle) {
  const ctx = { esri: false };
  let expr: string;
  if ("url" in style) expr = JSON.stringify(style.url);
  else if ("raster" in style) expr = "rasterStyle(" + print(style.raster, 0, false, ctx) + ")";
  else expr = print(style.object, 0, false, ctx);
  return { expr, esri: ctx.esri, isObject: !("url" in style), isRaster: "raster" in style };
}

function viewProps(v: View) {
  const parts = [`center: [${v.center.join(", ")}]`, `zoom: ${v.zoom}`];
  if (v.pitch) parts.push(`pitch: ${v.pitch}`);
  if (v.bearing) parts.push(`bearing: ${v.bearing}`);
  return parts;
}

export const pascal = (id: string) => id.replace(/(^|[-_])(\w)/g, (_, __, c: string) => c.toUpperCase());

export function appCode(d: Demo): string {
  const s = styleExpr(d.style);
  const L: string[] = [];
  L.push(`import { Map, Camera${s.isObject ? ", type StyleSpecification" : ""} }`);
  L.push(`  from "@maplibre/maplibre-react-native";`);
  if (s.isRaster) L.push(`import { rasterStyle } from "./mapModes"; // helper do projeto`);
  L.push("");
  if (s.esri) L.push(`const ESRI = "${ESRI}";`, "");
  L.push(`const STYLE${s.isObject ? ": StyleSpecification" : ""} = ${s.expr};`, "");
  L.push(`export default function Mapa${pascal(d.id)}() {`);
  L.push(`  return (`);
  L.push(`    <Map style={{ flex: 1 }} mapStyle={STYLE} compass scaleBar>`);
  L.push(`      <Camera`);
  L.push(`        initialViewState={{`);
  viewProps(d.view).forEach((p) => L.push(`          ${p},`));
  L.push(`        }}`);
  L.push(`      />`);
  L.push(`    </Map>`);
  L.push(`  );`);
  L.push(`}`);
  return L.join("\n");
}

export function webCode(d: Demo): string {
  const s = styleExpr(d.style);
  const L: string[] = [];
  L.push(`import * as maplibregl from "maplibre-gl";`);
  L.push(`import "maplibre-gl/dist/maplibre-gl.css";`);
  if (s.isRaster) L.push(`import { rasterStyle } from "./mapModes"; // helper do projeto`);
  L.push("");
  if (s.esri) L.push(`const ESRI = "${ESRI}";`, "");
  L.push(`const STYLE = ${s.expr};`, "");
  L.push(`const map = new maplibregl.Map({`);
  L.push(`  container: "map",          // id da <div>`);
  L.push(`  style: STYLE,`);
  viewProps(d.view).forEach((p, i) => L.push(`  ${p},${i === 0 ? "   // [lng, lat]" : ""}`));
  L.push(`});`);
  L.push("");
  L.push(`map.addControl(new maplibregl.NavigationControl());`);
  L.push(`map.addControl(new maplibregl.ScaleControl());`);
  return L.join("\n");
}

/* ------------------------------------------------------------------ */
/* Dados das demos extras                                              */
/* ------------------------------------------------------------------ */
export const PLAYGROUND_STYLE: StyleSpecification = {
  version: 8,
  glyphs: GLYPHS,
  sources: {
    openmaptiles: { type: "vector", url: "https://tiles.openfreemap.org/planet" },
  },
  layers: [
    { id: "fundo", type: "background", paint: { "background-color": "#ebe5da" } },
    { id: "agua", type: "fill", source: "openmaptiles", "source-layer": "water", paint: { "fill-color": "#9ec7e8" } },
    { id: "parques", type: "fill", source: "openmaptiles", "source-layer": "park", paint: { "fill-color": "#b5dca5" } },
    { id: "predios", type: "fill", source: "openmaptiles", "source-layer": "building", minzoom: 14, paint: { "fill-color": "#d3c7bb", "fill-outline-color": "#b8a998" } },
    {
      id: "ruas", type: "line", source: "openmaptiles", "source-layer": "transportation",
      paint: { "line-color": "#ffffff", "line-width": ["interpolate", ["linear"], ["zoom"], 10, 0.5, 18, 14] },
    },
  ],
};

export const PONTOS: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: ([
    ["Praia do Centro", "praia", -45.4114, -23.6270],
    ["Prainha", "praia", -45.3904, -23.6311],
    ["Praia Martim de Sá", "praia", -45.3834, -23.6285],
    ["Praia do Indaiá", "praia", -45.4238, -23.6441],
    ["Praia de Massaguaçu", "praia", -45.3349, -23.5904],
    ["Praia da Cocanha", "praia", -45.3136, -23.5766],
    ["Morro Santo Antônio", "mirante", -45.4014, -23.6090],
    ["Museu de Arte e Cultura", "museu", -45.4110, -23.6225],
    ["Praça Cândido Mota", "praça", -45.4110, -23.6187],
  ] as const).map(([nome, tipo, lng, lat]) => ({
    type: "Feature" as const,
    properties: { nome, tipo },
    geometry: { type: "Point" as const, coordinates: [lng, lat] },
  })),
};
