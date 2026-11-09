import { useRef } from "react";
import maplibregl from "maplibre-gl";
import {
  ChefHat, Clapperboard, Image, Info, LayoutGrid, Map as MapIcon, MapPin, MousePointerClick, Mountain,
  Navigation, PenTool, Plane, RotateCw, Rotate3d, ShieldAlert, Video,
} from "lucide-react";
import { CodePanel, CodeTabs } from "../components/Code";
import { LiveMap } from "../components/LiveMap";
import { Callout, Html, I, IconBox, Kicker, Tag, type Tone } from "../components/ui";
import {
  DEMOS, OFM, PLACES, PONTOS, RASTER_HELPER, appCode, pascal, toRuntimeStyle, webCode, type Demo, type Kind,
} from "../data/demos";
import type { SlideDef } from "../deck/Deck";

const KIND: Record<Kind, { tone: Tone; tag?: "teal" | "amber"; Icon: typeof PenTool; label: string; color: string }> = {
  "vetorial": { tone: "accent", Icon: PenTool, label: "Vetorial", color: "var(--accent)" },
  "raster": { tone: "teal", tag: "teal", Icon: Image, label: "Raster", color: "var(--teal)" },
  "raster-dem": { tone: "amber", tag: "amber", Icon: Mountain, label: "Raster-DEM", color: "var(--amber)" },
};

/* ---------- Slide de uma demonstração ---------- */
function DemoSlide({ d, i }: { d: Demo; i: number }) {
  const k = KIND[d.kind];
  return (
    <div className="demo-grid">
      <LiveMap
        badge={d.badge ? <><ShieldAlert /> {d.badge}</> : <><k.Icon /> {k.label} · {d.source}</>}
        options={{ style: toRuntimeStyle(d.webStyle ?? d.style), ...d.view }}
      />
      <div className="demo-side">
        <div className="demo-head">
          <IconBox Icon={d.Icon} tone={k.tone} size="lg" />
          <div>
            <Tag tone={k.tag} Icon={k.Icon}>{d.kind}</Tag>
            {d.cors && <Tag tone="rose" Icon={ShieldAlert}>CORS na web</Tag>}
            <Tag tone="gray">Demo {i + 1} de {DEMOS.length}</Tag>
            <h2>{d.label}</h2>
          </div>
        </div>
        <p className="demo-purpose">{d.purpose}</p>
        <ul className="clean demo-bullets">
          {d.bullets.map((b, j) => <Html key={j} as="li" html={b} />)}
        </ul>
        <CodeTabs
          app={{ file: `Mapa${pascal(d.id)}.tsx`, code: appCode(d) }}
          web={{ file: `mapa-${d.id}.js`, code: webCode(d) }}
          note={"raster" in d.style ? "rasterStyle() está no slide \"Receita raster\" e em mapModes.ts" : undefined}
        />
      </div>
    </div>
  );
}

/* ---------- Câmera ao vivo ---------- */
function CameraDemo() {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const fly = (center: [number, number]) => mapRef.current?.flyTo({ center, zoom: 12, duration: 4000, pitch: 0 });
  return (
    <div className="demo-grid">
      <LiveMap
        badge={<><MousePointerClick /> Clique nos botões abaixo</>}
        options={{ style: `${OFM}/liberty`, center: PLACES.sp, zoom: 11 }}
        setup={(m) => { mapRef.current = m; return () => { mapRef.current = null; }; }}
      >
        <div className="map-buttons">
          <button onClick={() => fly(PLACES.sp)}><Plane /> São Paulo</button>
          <button onClick={() => fly(PLACES.rio)}><Plane /> Rio de Janeiro</button>
          <button onClick={() => fly(PLACES.bsb)}><Plane /> Brasília</button>
          <button onClick={() => mapRef.current?.easeTo({ pitch: 60, zoom: 16, duration: 1500 })}><Rotate3d /> Inclinar 3D</button>
          <button onClick={() => { const m = mapRef.current; m?.rotateTo(m.getBearing() + 180, { duration: 3000 }); }}><RotateCw /> Girar 180°</button>
          <button onClick={() => mapRef.current?.easeTo({ pitch: 0, bearing: 0, zoom: 12, duration: 1000 })}><Navigation /> Vista de cima</button>
        </div>
      </LiveMap>
      <div className="demo-side">
        <div className="demo-head">
          <IconBox Icon={Video} tone="violet" size="lg" />
          <div><Tag Icon={Clapperboard}>Interatividade</Tag><h2>Câmera em ação</h2></div>
        </div>
        <p className="demo-purpose">Animações de câmera para guiar o usuário: voar até um lugar, inclinar para 3D e girar.</p>
        <CodeTabs
          app={{ file: "CameraDemo.tsx", code: `import { useRef } from "react";
import { Button, View } from "react-native";
import { Map, Camera, type CameraRef } from "@maplibre/maplibre-react-native";

export default function CameraDemo() {
  const camera = useRef<CameraRef>(null);

  const irPara = (center: [number, number]) =>
    camera.current?.flyTo({ center, zoom: 12, duration: 4000 });

  return (
    <View style={{ flex: 1 }}>
      <Map style={{ flex: 1 }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty">
        <Camera ref={camera}
          initialViewState={{ center: [-46.6339, -23.5503], zoom: 11 }} />
      </Map>

      <Button title="Rio de Janeiro"
        onPress={() => irPara([-43.1729, -22.9068])} />
      <Button title="Brasília"
        onPress={() => irPara([-47.8645, -15.7998])} />
      <Button title="Inclinar 3D"
        onPress={() => camera.current?.setStop({ pitch: 60, zoom: 16, duration: 1500 })} />
      <Button title="Vista de cima"
        onPress={() => camera.current?.setStop({ pitch: 0, bearing: 0, duration: 1000 })} />
    </View>
  );
}` }}
          web={{ file: "camera.js", code: `const map = new maplibregl.Map({
  container: "map",
  style: "https://tiles.openfreemap.org/styles/liberty",
  center: [-46.6339, -23.5503],
  zoom: 11,
});

// Voa até o Rio (afasta → viaja → aproxima)
map.flyTo({ center: [-43.1729, -22.9068], zoom: 12, duration: 4000 });

// Inclina para ver os prédios em 3D
map.easeTo({ pitch: 60, zoom: 16, duration: 1500 });

// Gira 180° em relação à rotação atual
map.rotateTo(map.getBearing() + 180, { duration: 3000 });

// Volta para a vista de cima
map.easeTo({ pitch: 0, bearing: 0, duration: 1000 });` }}
        />
      </div>
    </div>
  );
}

/* ---------- GeoJSON ao vivo ---------- */
function setupPontos(map: maplibregl.Map) {
  map.on("load", () => {
    map.addSource("pontos", { type: "geojson", data: PONTOS });
    map.addLayer({
      id: "pontos-circulo", type: "circle", source: "pontos",
      paint: {
        "circle-radius": 9,
        "circle-color": ["match", ["get", "tipo"], "museu", "#7c3aed", "parque", "#16a34a", "mercado", "#d97706", "#e11d48"],
        "circle-stroke-width": 3,
        "circle-stroke-color": "#ffffff",
      },
    });
    map.addLayer({
      id: "pontos-nome", type: "symbol", source: "pontos",
      layout: { "text-field": ["get", "nome"], "text-font": ["Noto Sans Bold"], "text-size": 13, "text-offset": [0, 1.2], "text-anchor": "top" },
      paint: { "text-halo-color": "#ffffff", "text-halo-width": 2 },
    });
    map.on("click", "pontos-circulo", (e) => {
      const p = e.features?.[0]?.properties as { nome: string; tipo: string } | undefined;
      if (p) new maplibregl.Popup().setLngLat(e.lngLat).setHTML(`<b>${p.nome}</b><br>${p.tipo}`).addTo(map);
    });
    map.on("mouseenter", "pontos-circulo", () => (map.getCanvas().style.cursor = "pointer"));
    map.on("mouseleave", "pontos-circulo", () => (map.getCanvas().style.cursor = ""));
  });
}

function GeoJsonDemo() {
  return (
    <div className="demo-grid">
      <LiveMap
        badge={<><MousePointerClick /> Clique em um ponto</>}
        options={{ style: `${OFM}/positron`, center: [-46.645, -23.556], zoom: 12.6 }}
        setup={setupPontos}
      />
      <div className="demo-side">
        <div className="demo-head">
          <IconBox Icon={MapPin} tone="rose" size="lg" />
          <div><Tag tone="rose">Seus dados</Tag><h2>GeoJSON + camadas</h2></div>
        </div>
        <p className="demo-purpose">Pontos próprios sobre uma base neutra, coloridos por categoria com <I>match</I> e com clique.</p>
        <CodeTabs
          app={{ file: "MeusPontos.tsx", code: `import { Alert } from "react-native";
import { Map, Camera, GeoJSONSource, Layer } from "@maplibre/maplibre-react-native";
import { PONTOS } from "./pontos"; // GeoJSON FeatureCollection

export default function MeusPontos() {
  return (
    <Map style={{ flex: 1 }}
      mapStyle="https://tiles.openfreemap.org/styles/positron">
      <Camera initialViewState={{ center: [-46.645, -23.556], zoom: 12.6 }} />

      <GeoJSONSource
        id="pontos"
        data={PONTOS}
        onPress={(e) => {
          const p = e.nativeEvent.features[0]?.properties;
          if (p) Alert.alert(p.nome, p.tipo);
        }}
      >
        <Layer id="pontos-circulo" type="circle" paint={{
          "circle-radius": 9,
          "circle-color": ["match", ["get", "tipo"],
            "museu", "#7c3aed", "parque", "#16a34a",
            "mercado", "#d97706", "#e11d48"],
          "circle-stroke-width": 3,
          "circle-stroke-color": "#ffffff",
        }} />
        <Layer id="pontos-nome" type="symbol"
          layout={{
            "text-field": ["get", "nome"],
            "text-font": ["Noto Sans Bold"],
            "text-size": 13,
            "text-offset": [0, 1.2],
            "text-anchor": "top",
          }}
          paint={{ "text-halo-color": "#ffffff", "text-halo-width": 2 }} />
      </GeoJSONSource>
    </Map>
  );
}` }}
          web={{ file: "pontos.js", code: `map.on("load", () => {
  map.addSource("pontos", { type: "geojson", data: PONTOS });

  map.addLayer({
    id: "pontos-circulo", type: "circle", source: "pontos",
    paint: {
      "circle-radius": 9,
      "circle-color": ["match", ["get", "tipo"],
        "museu", "#7c3aed", "parque", "#16a34a",
        "mercado", "#d97706", "#e11d48"],
      "circle-stroke-width": 3,
      "circle-stroke-color": "#ffffff",
    },
  });

  map.addLayer({
    id: "pontos-nome", type: "symbol", source: "pontos",
    layout: {
      "text-field": ["get", "nome"],
      "text-font": ["Noto Sans Bold"],
      "text-size": 13,
      "text-offset": [0, 1.2],
      "text-anchor": "top",
    },
    paint: { "text-halo-color": "#ffffff", "text-halo-width": 2 },
  });

  // Clique em um ponto → popup
  map.on("click", "pontos-circulo", (e) => {
    const p = e.features[0].properties;
    new maplibregl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(\`<b>\${p.nome}</b><br>\${p.tipo}\`)
      .addTo(map);
  });
  map.on("mouseenter", "pontos-circulo", () => {
    map.getCanvas().style.cursor = "pointer";
  });
});` }}
        />
      </div>
    </div>
  );
}

/* ---------- Lista de slides ---------- */
const rasterRecipe: SlideDef = {
  section: "Demonstrações",
  notes: "É só uma função que transforma uma lista de URLs de tiles em um Style JSON válido.",
  Body: () => (
    <>
      <Kicker Icon={ChefHat}>Receita raster</Kicker>
      <h2>Um helper para montar estilos raster</h2>
      <div className="cols-2 grow">
        <div>
          <ul className="clean">
            <li>Fontes raster não têm um Style JSON pronto: nós montamos um.</li>
            <li>Cada item vira uma <I>source</I> + uma <I>layer</I> do tipo <I>raster</I>.</li>
            <li>A ordem do array é a ordem de desenho — dá para empilhar <b>base + overlay</b>.</li>
            <li>O objeto resultante vai direto em <I>mapStyle</I> (app) ou <I>style</I> (web).</li>
          </ul>
          <Callout Icon={Info} className="mt-s">
            Próximas demos usam este helper: Satélite, Topográfico, Explorador, Ciclismo, Transporte, Ferrovias, Náutico e Serviços.
          </Callout>
        </div>
        <CodePanel title="mapModes.ts" file="compartilhado app + web" blocks={[{ lang: "typescript", code: RASTER_HELPER }]} />
      </div>
    </>
  ),
};

export const demoSlides: SlideDef[] = [
  {
    section: "Demonstrações",
    variant: "section",
    notes: "Lembre: dá para interagir com cada mapa. A aba App/Web vale para todas as demos.",
    Body: () => (
      <>
        <div className="num">05</div>
        <h2>Demonstrações</h2>
        <p>13 mapas com 13 finalidades — todos ao vivo, todos com o código ao lado.</p>
      </>
    ),
  },
  {
    section: "Demonstrações",
    notes: "Visão geral antes das demos individuais. Azul = vetorial (desenhado no aparelho), verde = raster (imagem pronta), laranja = elevação.",
    Body: () => (
      <>
        <Kicker Icon={LayoutGrid}>Catálogo</Kicker>
        <h2>Os 13 mapas do nosso app</h2>
        <div className="modes">
          {DEMOS.map((d) => (
            <div key={d.id} className="mode" style={{ borderTop: `.3rem solid ${KIND[d.kind].color}` }}>
              <IconBox Icon={d.Icon} tone={KIND[d.kind].tone} size="sm" />
              <b>{d.label}</b>
              <span className="src">{d.source}</span>
            </div>
          ))}
          <div className="mode" style={{ borderTop: ".3rem solid var(--rose)" }}>
            <IconBox Icon={MapIcon} tone="rose" size="sm" />
            <b>+ 2 extras</b>
            <span className="src">Câmera animada e GeoJSON próprio</span>
          </div>
          <div className="mode legend" style={{ background: "transparent", borderStyle: "dashed" }}>
            <div><i style={{ background: "var(--accent)" }} />vetorial</div>
            <div><i style={{ background: "var(--teal)" }} />raster</div>
            <div><i style={{ background: "var(--amber)" }} />elevação</div>
          </div>
        </div>
        <Callout Icon={Info} className="mt">
          Todos vivem em <I>mapModes.ts</I> — uma lista compartilhada por <I>App.tsx</I> (Android/iOS) e <I>App.web.tsx</I> (navegador).
        </Callout>
      </>
    ),
  },
  ...DEMOS.flatMap((d, i): SlideDef[] => {
    const slide: SlideDef = { section: "Demonstrações", notes: d.notes, Body: () => <DemoSlide d={d} i={i} /> };
    return d.id === "satellite" ? [rasterRecipe, slide] : [slide];
  }),
  {
    section: "Demonstrações",
    notes: "Clique em Rio, depois Brasília: veja a curva do flyTo. Depois Inclinar 3D em São Paulo e Girar.",
    Body: CameraDemo,
  },
  {
    section: "Demonstrações",
    notes: "Aqui juntamos tudo: fonte GeoJSON, duas camadas (círculo e texto), expressão match e evento de clique. Clique no MASP ou no Ibirapuera.",
    Body: GeoJsonDemo,
  },
];
