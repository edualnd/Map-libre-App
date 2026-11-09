import type { StyleSpecification } from "maplibre-gl";
import {
  Anchor, Bike, Building2, Bus, Compass, Hospital, Minimize2, Moon, Mountain,
  MountainSnow, Satellite, Store, TrainFront, type LucideIcon,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Fontes e helpers — iguais aos de mapModes.ts no app                 */
/* ------------------------------------------------------------------ */
export const OFM = "https://tiles.openfreemap.org/styles";
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

/* ------------------------------------------------------------------ */
/* As 13 demonstrações                                                 */
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
  webStyle?: DemoStyle;
  webComment?: string;
  view: View;
  badge?: string;
  cors?: boolean;
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
    view: { center: [-46.6365, -23.5475], zoom: 16.2 },
    notes: "Dê zoom e mostre os ícones de lojas e os números das casas. Tudo isso vem dos dados do OpenStreetMap.",
  },
  {
    id: "minimal", label: "Minimalista", Icon: Minimize2, kind: "vetorial", source: "OpenFreeMap · Positron",
    purpose: "Base limpa e neutra para destacar os SEUS dados por cima — pontos, rotas e mapas de calor.",
    bullets: [
      "Mesmos dados do Liberty: só o Style JSON muda.",
      "Menos ruído visual = leitura mais rápida.",
      "Ideal com <code class='i'>GeoJSONSource</code> (veja a demo de pontos).",
    ],
    style: { url: `${OFM}/positron` },
    view: { center: [-46.6388, -23.5558], zoom: 12.5 },
    notes: "Compare com o slide anterior: mesma cidade, mesmos dados, outra receita.",
  },
  {
    id: "night", label: "Noturno", Icon: Moon, kind: "vetorial", source: "OpenFreeMap · Dark",
    purpose: "Uso à noite ou no modo escuro do sistema: menos brilho e mais conforto.",
    bullets: [
      "Trocar de tema = trocar uma string. Zero mudança na lógica.",
      "No app: combine com <code class='i'>useColorScheme()</code>.",
      "Na web: combine com <code class='i'>prefers-color-scheme</code>.",
    ],
    style: { url: `${OFM}/dark` },
    view: { center: [-46.6388, -23.5558], zoom: 13 },
    notes: "Bom momento para falar de acessibilidade e conforto visual.",
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
    view: { center: [-46.6555, -23.5625], zoom: 16.3, pitch: 60, bearing: -30 },
    notes: "Av. Paulista. Gire com o botão direito do mouse para mostrar o efeito 3D.",
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
    view: { center: [-43.1729, -22.9555], zoom: 13.6 },
    notes: "Rio de Janeiro: Pão de Açúcar e Botafogo. Note que é um estilo montado à mão com rasterStyle().",
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
    view: { center: [-45.585, -22.735], zoom: 12.5 },
    notes: "Campos do Jordão, Serra da Mantiqueira. Mostre as curvas de nível.",
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
    view: { center: [-43.25, -22.93], zoom: 10.6 },
    notes: "Rio de Janeiro: maciço da Tijuca, Pedra Branca e Serra do Mar. Os dados são raster, mas o desenho é calculado na GPU.",
  },
  {
    id: "explorer", label: "Explorador", Icon: Compass, kind: "raster", source: "Esri · National Geographic",
    purpose: "Turismo e educação: cartografia editorial com parques, reservas e relevo.",
    bullets: [
      "Estilo clássico da National Geographic.",
      "Destaca unidades de conservação e nomes geográficos.",
      "<code class='i'>maxzoom: 16</code> — é um mapa de visão regional.",
    ],
    style: {
      raster: [
        { id: "natgeo", tiles: [`${ESRI}/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}`], attribution: "© Esri, National Geographic, Garmin, HERE", maxzoom: 16 },
      ],
    },
    view: { center: [-54.35, -25.62], zoom: 9.3 },
    notes: "Parque Nacional do Iguaçu e a tríplice fronteira.",
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
    view: { center: [-46.664, -23.578], zoom: 14.2 },
    notes: "Região da Paulista e do Ibirapuera. Mostre as ciclovias em azul.",
  },
  {
    id: "transit", label: "Transporte", Icon: Bus, kind: "raster", source: "ÖPNVKarte (app) · Liberty (web)", cors: true,
    purpose: "Mobilidade urbana: linhas de ônibus, metrô, trem e paradas.",
    bullets: [
      "<b>No app:</b> ÖPNVKarte, com cada linha colorida.",
      "<b>No navegador:</b> o servidor não envia <code class='i'>Access-Control-Allow-Origin</code> → os tiles são bloqueados por CORS.",
      "Solução do projeto: um <code class='i'>web</code> fallback por plataforma em <code class='i'>mapModes.ts</code>.",
    ],
    style: {
      raster: [
        { id: "opnv", tiles: ["https://tileserver.memomaps.de/tilegen/{z}/{x}/{y}.png"], attribution: `${OSM} | © MeMoMaps`, maxzoom: 18 },
      ],
    },
    webStyle: { url: `${OFM}/liberty` },
    webComment: "// O ÖPNVKarte não envia cabeçalho CORS: o navegador bloqueia os tiles.\n// Na web usamos um fallback vetorial que também mostra estações e linhas.",
    view: { center: [-46.6352, -23.5352], zoom: 15.2 },
    badge: "Navegador → fallback (CORS)",
    notes: "Ponto didático: o mapa à esquerda é o fallback, porque estamos num navegador. Mostre a aba App (ÖPNVKarte) e a aba Web (fallback).",
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
    view: { center: [-46.625, -23.54], zoom: 12.6 },
    notes: "Região da Luz e do Brás: linhas da CPTM e do Metrô.",
  },
  {
    id: "nautical", label: "Náutico", Icon: Anchor, kind: "raster", source: "Esri Ocean + OpenSeaMap",
    purpose: "Navegação e pesca: profundidade, boias, faróis e canais de acesso.",
    bullets: [
      "Batimetria (profundidade do mar) da Esri Ocean.",
      "Sinalização náutica do OpenSeaMap por cima.",
      "Três camadas raster combinadas em um estilo.",
    ],
    style: {
      raster: [
        { id: "ocean", tiles: [`${ESRI}/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}`], attribution: "© Esri, GEBCO, NOAA", maxzoom: 16 },
        { id: "oceanref", tiles: [`${ESRI}/Ocean/World_Ocean_Reference/MapServer/tile/{z}/{y}/{x}`], attribution: "© Esri", maxzoom: 16 },
        { id: "seamarks", tiles: ["https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"], attribution: "© OpenSeaMap", maxzoom: 18 },
      ],
    },
    view: { center: [-46.315, -23.985], zoom: 13 },
    notes: "Porto de Santos: veja as boias marcando o canal de navegação.",
  },
  {
    id: "humanitarian", label: "Serviços", Icon: Hospital, kind: "raster", source: "OSM Humanitário (HOT)",
    purpose: "Resposta a emergências e mapeamento social: hospitais, escolas, água e abrigos.",
    bullets: [
      "Estilo da Humanitarian OpenStreetMap Team.",
      "Realça serviços essenciais em vez de comércio.",
      "Usado em desastres e projetos de mapeamento comunitário.",
    ],
    style: {
      raster: [
        { id: "hot", tiles: abc("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", ["a", "b"]), attribution: `${OSM} | HOT / OSM France`, maxzoom: 20 },
      ],
    },
    view: { center: [-46.6415, -23.5505], zoom: 15 },
    notes: "Centro de São Paulo. Compare com o primeiro mapa: mesma área, prioridade diferente.",
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
  L.push(`import { Map, Camera, UserLocation${s.isObject ? ", type StyleSpecification" : ""} }`);
  L.push(`  from "@maplibre/maplibre-react-native";`);
  if (s.isRaster) L.push(`import { rasterStyle } from "./mapModes"; // helper do projeto`);
  L.push("");
  if (s.esri) L.push(`const ESRI = "${ESRI}";`, "");
  L.push(`const STYLE${s.isObject ? ": StyleSpecification" : ""} = ${s.expr};`, "");
  L.push(`export default function Mapa${pascal(d.id)}() {`);
  L.push(`  return (`);
  L.push(`    <Map style={{ flex: 1 }} mapStyle={STYLE} compass>`);
  L.push(`      <Camera`);
  L.push(`        initialViewState={{`);
  viewProps(d.view).forEach((p) => L.push(`          ${p},`));
  L.push(`        }}`);
  L.push(`      />`);
  L.push(`      <UserLocation accuracy />`);
  L.push(`    </Map>`);
  L.push(`  );`);
  L.push(`}`);
  return L.join("\n");
}

export function webCode(d: Demo): string {
  const s = styleExpr(d.webStyle ?? d.style);
  const L: string[] = [];
  L.push(`import * as maplibregl from "maplibre-gl";`);
  L.push(`import "maplibre-gl/dist/maplibre-gl.css";`);
  if (s.isRaster) L.push(`import { rasterStyle } from "./mapModes"; // helper do projeto`);
  L.push("");
  if (d.webComment) L.push(d.webComment);
  if (s.esri) L.push(`const ESRI = "${ESRI}";`, "");
  L.push(`const STYLE = ${s.expr};`, "");
  L.push(`const map = new maplibregl.Map({`);
  L.push(`  container: "map",          // id da <div>`);
  L.push(`  style: STYLE,`);
  viewProps(d.view).forEach((p, i) => L.push(`  ${p},${i === 0 ? "   // [lng, lat]" : ""}`));
  L.push(`});`);
  L.push("");
  L.push(`map.addControl(new maplibregl.NavigationControl());`);
  L.push(`map.addControl(new maplibregl.GeolocateControl({ trackUserLocation: true }));`);
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
    ["MASP", "museu", -46.6559, -23.5614],
    ["Pinacoteca", "museu", -46.6339, -23.5342],
    ["Museu do Ipiranga", "museu", -46.6097, -23.5855],
    ["Parque Ibirapuera", "parque", -46.6575, -23.5874],
    ["Parque da Luz", "parque", -46.6345, -23.5362],
    ["Mercadão", "mercado", -46.6297, -23.5417],
    ["Theatro Municipal", "teatro", -46.6388, -23.5452],
    ["Catedral da Sé", "igreja", -46.6342, -23.5513],
  ] as const).map(([nome, tipo, lng, lat]) => ({
    type: "Feature" as const,
    properties: { nome, tipo },
    geometry: { type: "Point" as const, coordinates: [lng, lat] },
  })),
};

export const PLACES = {
  sp: [-46.6339, -23.5503] as [number, number],
  rio: [-43.1729, -22.9068] as [number, number],
  bsb: [-47.8645, -15.7998] as [number, number],
};
