import { useRef, useState, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import maplibregl from "maplibre-gl";
import {
  Anchor, Binoculars, Camera as CameraIcon, Crop, Eye, Footprints, Layers, Landmark, LocateFixed, Map as MapIcon, MapPin, MapPinned,
  MousePointerClick, Navigation, Plane, RotateCw, Rotate3d, SunDim, type LucideIcon,
} from "lucide-react";
import { CodeTabs } from "../components/Code";
import { LiveMap } from "../components/LiveMap";
import { IconBox, Tag } from "../components/ui";
import { CARAGUA, OFM, PONTOS, print } from "../data/demos";
import type { SlideDef } from "../deck/Deck";

/* ------------------------------------------------------------------ */
/* Estrutura comum de um passo                                         */
/* ------------------------------------------------------------------ */
type ApiKind = "componente" | "atributo" | "função" | "evento";
type ApiItem = { name: string; kind: ApiKind; desc: string };

type Step = {
  title: string;
  Icon: LucideIcon;
  purpose: ReactNode;
  items: ApiItem[];
  app: { file: string; code: string };
  web: { file: string; code: string };
  extra?: { file: string; code: string; note?: string };
};

const TOTAL = 6;

function StepSlide({ n, step, map }: { n: number; step: Step; map: ReactNode }) {
  return (
    <div className="demo-grid">
      {map}
      <div className="demo-side">
        <div className="demo-head">
          <IconBox Icon={step.Icon} size="lg" />
          <div>
            <Tag Icon={Footprints}>Passo {n} de {TOTAL}</Tag>
            <h2>{step.title}</h2>
          </div>
        </div>
        <p className="demo-purpose">{step.purpose}</p>
        <div className="api-items">
          {step.items.map((it) => (
            <div key={it.name} className={`api-item k-${it.kind === "função" ? "funcao" : it.kind}`}>
              <code>{it.name}</code>
              <span className="kind">{it.kind}</span>
              <span className="desc">{it.desc}</span>
            </div>
          ))}
        </div>
        <CodeTabs app={step.app} web={step.web} extra={step.extra} />
      </div>
    </div>
  );
}

const LIBERTY = `${OFM}/liberty`;
const C = `[${CARAGUA.join(", ")}]`; // como aparece no código exibido

/* ------------------------------------------------------------------ */
/* Passo 1 — <Map> + <Camera>, com valores escolhidos ao vivo          */
/* ------------------------------------------------------------------ */
type Cam = { place: string; center: [number, number]; zoom: number; pitch: number; bearing: number };

const CENTERS: { label: string; center: [number, number] }[] = [
  { label: "Caraguatatuba", center: CARAGUA },
  { label: "Ilhabela", center: [-45.3578, -23.7774] },
  { label: "Ubatuba", center: [-45.0722, -23.4353] },
];
const ZOOMS = [5, 11, 14, 17];
const PITCHES = [0, 30, 60];
const BEARINGS = [-45, 0, 45, 90];

const cameraItems: ApiItem[] = [
  { name: "<Map>", kind: "componente", desc: "A view do mapa — todo o resto fica dentro dela" },
  { name: "mapStyle", kind: "atributo", desc: "URL ou objeto do Style JSON (obrigatório)" },
  { name: "<Camera>", kind: "componente", desc: "Define o ponto de vista do mapa" },
  { name: "initialViewState", kind: "atributo", desc: "Posição inicial, sem prender a câmera" },
  { name: "center · zoom", kind: "atributo", desc: "[lng, lat] e 0 (planeta) a ~22 (rua)" },
  { name: "pitch · bearing", kind: "atributo", desc: "Inclinação (0–85°) e rotação (0 = norte)" },
];

function cameraStep(c: Cam): Step {
  const center = `[${c.center[0]}, ${c.center[1]}]`;
  // alinha os comentários, qualquer que seja o tamanho dos valores
  const ln = (code: string, comment: string, w: number) => `${code.padEnd(w)}// ${comment}`;
  const app = (k: string, v: string, comment: string) => ln(`          ${k}: ${v},`, comment, 46);
  const web = (k: string, v: string, comment: string) => ln(`  ${k}: ${v},`, comment, 38);
  return {
    title: "O mapa e a câmera",
    Icon: MapIcon,
    purpose: "<Map> desenha o mapa; <Camera> escolhe para onde ele olha. Use os botões no mapa: o código ao lado muda junto.",
    items: cameraItems,
    app: {
      file: "App.tsx",
      code: `import { Map, Camera } from "@maplibre/maplibre-react-native";

export default function App() {
  return (
    <Map
      style={{ flex: 1 }}   // ocupa a tela toda
      mapStyle="https://tiles.openfreemap.org/styles/liberty"
    >
      <Camera
        initialViewState={{
${app("center", center, `[lng, lat] — ${c.place}`)}
${app("zoom", String(c.zoom), "0 = planeta · ~22 = rua")}
${app("pitch", String(c.pitch), "0 = de cima · até 85°")}
${app("bearing", String(c.bearing), "0 = norte para cima")}
        }}
        minZoom={3}           // limites de navegação
        maxZoom={19}
      />
    </Map>
  );
}`,
    },
    web: {
      file: "mapa.js",
      code: `import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Equivalente a <Map>; na web a câmera são opções do próprio Map
const map = new maplibregl.Map({
  container: "map",   // id da <div> (precisa ter altura!)
  style: "https://tiles.openfreemap.org/styles/liberty",
${web("center", center, `[lng, lat] — ${c.place}`)}
${web("zoom", String(c.zoom), "0 = planeta · ~22 = rua")}
${web("pitch", String(c.pitch), "0 = de cima · até 85°")}
${web("bearing", String(c.bearing), "0 = norte para cima")}
  minZoom: 3,         // limites de navegação
  maxZoom: 19,
});`,
    },
  };
}

function CameraStepSlide() {
  const [c, setC] = useState<Cam>({ place: "Caraguatatuba", center: CARAGUA, zoom: 14, pitch: 45, bearing: 0 });
  const mapRef = useRef<maplibregl.Map | null>(null);
  const apply = (next: Cam, fly = false) => {
    setC(next);
    const m = mapRef.current;
    if (!m) return;
    const opts = { center: next.center, zoom: next.zoom, pitch: next.pitch, bearing: next.bearing };
    if (fly) m.flyTo({ ...opts, duration: 3500 });
    else m.easeTo({ ...opts, duration: 1200 });
  };
  const row = <T,>(label: string, values: T[], cur: T, text: (v: T) => string, pick: (v: T) => void) => (
    <div className="cam-row">
      <code>{label}</code>
      {values.map((v) => (
        <button key={text(v)} className={v === cur ? "on" : ""} onClick={() => pick(v)}>{text(v)}</button>
      ))}
    </div>
  );
  const map = (
    <LiveMap
      badge={<><CameraIcon /> Escolha os valores da câmera</>}
      options={{ style: LIBERTY, center: c.center, zoom: c.zoom, pitch: c.pitch, bearing: c.bearing, minZoom: 3, maxZoom: 19 }}
      setup={(m) => { mapRef.current = m; return () => { mapRef.current = null; }; }}
    >
      <div className="cam-panel">
        {row("center", CENTERS, CENTERS.find((x) => x.label === c.place)!, (v) => v.label,
          (v) => apply({ ...c, place: v.label, center: v.center }, true))}
        {row("zoom", ZOOMS, c.zoom, String, (v) => apply({ ...c, zoom: v }))}
        {row("pitch", PITCHES, c.pitch, (v) => `${v}°`, (v) => apply({ ...c, pitch: v }))}
        {row("bearing", BEARINGS, c.bearing, (v) => `${v}°`, (v) => apply({ ...c, bearing: v }))}
      </div>
    </LiveMap>
  );
  return <StepSlide n={1} step={cameraStep(c)} map={map} />;
}

/* ------------------------------------------------------------------ */
/* Passo 2 — <UserLocation> e controles                                */
/* ------------------------------------------------------------------ */
const stepLocation: Step = {
  title: "Onde estou: <UserLocation>",
  Icon: LocateFixed,
  purpose: "O ponto azul do usuário e os controles do mapa. No app, a permissão de GPS vem do hook do expo-location.",
  items: [
    { name: "<UserLocation>", kind: "componente", desc: "Ponto azul; heading mostra a direção" },
    { name: "trackUserLocation", kind: "atributo", desc: "Camera segue o usuário: default · heading · course" },
    { name: "compass · scaleBar", kind: "atributo", desc: "Bússola e barra de escala do <Map>" },
    { name: "attribution · logo", kind: "atributo", desc: "Créditos e logo — mantenha os créditos!" },
    { name: "useForegroundPermissions", kind: "função", desc: "Hook do expo-location: status + pedir" },
  ],
  app: {
    file: "App.tsx",
    code: `import { useEffect } from "react";
import * as Location from "expo-location";
import { Map, Camera, UserLocation } from "@maplibre/maplibre-react-native";

export default function App() {
  // Hook do expo-location: [status atual, função que pede a permissão]
  const [permissao, pedirPermissao] = Location.useForegroundPermissions();

  useEffect(() => {
    pedirPermissao(); // abre o diálogo do sistema na primeira vez
  }, []);

  const permitido = permissao?.granted ?? false;

  return (
    <Map style={{ flex: 1 }}
      mapStyle="https://tiles.openfreemap.org/styles/liberty"
      compass           // bússola (aparece ao girar)
      scaleBar          // barra de escala
      attribution       // créditos dos dados
    >
      <Camera
        initialViewState={{ center: ${C}, zoom: 13 }} // Caraguatatuba
        trackUserLocation={permitido ? "default" : undefined}
      />
      {/* accuracy={false}: sem o círculo de precisão, que fica
          enorme quando o GPS ainda está impreciso */}
      {permitido && <UserLocation accuracy={false} heading />}
    </Map>
  );
}

// app.json → "plugins": [["expo-location", {
//   "locationWhenInUsePermission": "Usamos sua localização no mapa." }]]`,
  },
  web: {
    file: "mapa.js",
    code: `const map = new maplibregl.Map({
  container: "map",
  style: "https://tiles.openfreemap.org/styles/liberty",
  center: ${C},   // Caraguatatuba
  zoom: 13,
});

// Na web, controles são adicionados com addControl()
map.addControl(new maplibregl.NavigationControl()); // zoom + bússola
map.addControl(new maplibregl.ScaleControl());      // escala
map.addControl(new maplibregl.FullscreenControl()); // tela cheia

// Ponto azul — o navegador pede a permissão sozinho
// (só funciona em HTTPS ou localhost)
const geolocate = new maplibregl.GeolocateControl({
  positionOptions: { enableHighAccuracy: true },
  trackUserLocation: true,   // segue o usuário
  showAccuracyCircle: false, // sem o círculo de precisão (pode ser enorme)
});
map.addControl(geolocate);

geolocate.on("geolocate", (e) => console.log(e.coords));
geolocate.on("error", (e) => console.warn("Sem localização:", e.message));`,
  },
};

/** Mostra a localização real; se o navegador não conseguir, simula o ponto azul em Caraguatatuba. */
function LocationMap() {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const geoRef = useRef<maplibregl.GeolocateControl | null>(null);
  const fakeRef = useRef<maplibregl.Marker | null>(null);
  const [status, setStatus] = useState("Clique em “Minha localização”");

  const simulate = (why: string) => {
    const m = mapRef.current;
    if (!m) return;
    if (!fakeRef.current) {
      const el = document.createElement("div");
      el.className = "maplibregl-user-location-dot";
      fakeRef.current = new maplibregl.Marker({ element: el });
    }
    fakeRef.current.setLngLat(CARAGUA).addTo(m);
    m.flyTo({ center: CARAGUA, zoom: 15, duration: 2000 });
    setStatus(`${why} Ponto azul simulado em Caraguatatuba.`);
  };

  const locate = () => {
    if (!window.isSecureContext || !("geolocation" in navigator)) {
      simulate("Geolocalização exige HTTPS ou localhost.");
      return;
    }
    setStatus("Pedindo a localização ao navegador…");
    fakeRef.current?.remove();
    if (!geoRef.current?.trigger()) simulate("Geolocalização indisponível neste navegador.");
  };

  return (
    <LiveMap
      badge={<><LocateFixed /> GeolocateControl + controles</>}
      options={{ style: LIBERTY, center: CARAGUA, zoom: 13 }}
      setup={(m) => {
        mapRef.current = m;
        const geo = new maplibregl.GeolocateControl({
          positionOptions: { enableHighAccuracy: true, timeout: 8000 },
          trackUserLocation: true,
          showAccuracyCircle: false,
          fitBoundsOptions: { maxZoom: 15 },
        });
        geoRef.current = geo;
        m.addControl(geo, "top-right");
        m.addControl(new maplibregl.FullscreenControl(), "top-right");
        m.addControl(new maplibregl.ScaleControl(), "bottom-right");
        geo.on("geolocate", (e: GeolocationPosition) =>
          setStatus(`Localização real: ${e.coords.latitude.toFixed(4)}, ${e.coords.longitude.toFixed(4)} (±${Math.round(e.coords.accuracy)} m)`));
        geo.on("error", (e: GeolocationPositionError) =>
          simulate(e.code === 1 ? "Permissão negada." : "O navegador não conseguiu a posição."));
        return () => { mapRef.current = null; geoRef.current = null; fakeRef.current = null; };
      }}
    >
      <div className="map-info top">
        <div><b>status</b>{status}</div>
      </div>
      <div className="map-buttons">
        <button onClick={locate}><LocateFixed /> Minha localização</button>
        <button onClick={() => simulate("Simulação.")}><MapPin /> Simular em Caraguatatuba</button>
      </div>
    </LiveMap>
  );
}

/* ------------------------------------------------------------------ */
/* Passo 3 — câmera animada + marcadores                               */
/* ------------------------------------------------------------------ */
const LUGARES: { nome: string; lngLat: [number, number] }[] = [
  { nome: "Ubatuba", lngLat: [-45.0722, -23.4353] },
  { nome: "Ilhabela", lngLat: [-45.3578, -23.7774] },
  { nome: "São Sebastião", lngLat: [-45.3987, -23.8037] },
];
const MORRO: [number, number] = [-45.4014, -23.609];
const LITORAL_NORTE: [[number, number], [number, number]] = [[-45.75, -23.95], [-44.95, -23.35]];
const fmtLugares = LUGARES.map((l) => `  { nome: "${l.nome}", lngLat: [${l.lngLat.join(", ")}] },`).join("\n");

const stepCamera: Step = {
  title: "Câmera e marcadores",
  Icon: Plane,
  purpose: "Marcadores presos a coordenadas e, com uma ref para a <Camera>, animações: escolha uma cidade ou toque em um marcador e a câmera voa até lá.",
  items: [
    { name: "<Marker>", kind: "componente", desc: "Qualquer View presa a um lngLat (anchor)" },
    { name: "<ViewAnnotation>", kind: "componente", desc: "Arrastável; aceita um <Callout> (balão)" },
    { name: "onPress · onDragEnd", kind: "evento", desc: "Toque no marcador e fim do arraste" },
    { name: "flyTo()", kind: "função", desc: "Efeito avião: afasta, viaja e aproxima" },
    { name: "setStop() · easeTo()", kind: "função", desc: "Muda pitch, bearing ou zoom com transição" },
    { name: "fitBounds()", kind: "função", desc: "Enquadra um retângulo: [oeste, sul, leste, norte]" },
  ],
  app: {
    file: "App.tsx",
    code: `import { useRef } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import {
  Map, Camera, Marker, ViewAnnotation, Callout,
  type CameraRef, type LngLat,
} from "@maplibre/maplibre-react-native";

const LUGARES: { nome: string; lngLat: LngLat }[] = [
${fmtLugares}
];

export default function App() {
  const camera = useRef<CameraRef>(null);

  const voarPara = (lngLat: LngLat) =>
    camera.current?.flyTo({ center: lngLat, zoom: 14, duration: 4000 });

  return (
    <View style={{ flex: 1 }}>
      <Map style={{ flex: 1 }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty">
        <Camera ref={camera}
          initialViewState={{ center: ${C}, zoom: 10 }} />

        {/* Marker: tocar → a câmera voa até o lugar */}
        {LUGARES.map((l) => (
          <Marker key={l.nome} lngLat={l.lngLat} anchor="bottom"
            onPress={() => voarPara(l.lngLat)}>
            <View style={styles.pin}><Text>{l.nome}</Text></View>
          </Marker>
        ))}

        {/* ViewAnnotation: arrastável e com balão (Callout) */}
        <ViewAnnotation id="morro" lngLat={[${MORRO.join(", ")}]}
          draggable
          onDragEnd={(e) => console.log(e.nativeEvent.lngLat)}>
          <View style={styles.pin} />
          <Callout title="Morro Santo Antônio" />
        </ViewAnnotation>
      </Map>

      {/* Um botão por cidade */}
      {LUGARES.map((l) => (
        <Button key={l.nome} title={l.nome} onPress={() => voarPara(l.lngLat)} />
      ))}
      <Button title="Inclinar 3D" onPress={() =>
        camera.current?.setStop({ pitch: 60, zoom: 16, duration: 1500 })} />
      <Button title="Girar 180°" onPress={() =>
        camera.current?.setStop({ bearing: 180, duration: 3000 })} />
      <Button title="Litoral Norte" onPress={() =>
        // [oeste, sul, leste, norte]
        camera.current?.fitBounds([${LITORAL_NORTE[0].join(", ")}, ${LITORAL_NORTE[1].join(", ")}])} />
    </View>
  );
}

const styles = StyleSheet.create({
  pin: { backgroundColor: "#fff", padding: 6, borderRadius: 8, borderWidth: 2, borderColor: "#e11d48" },
});`,
  },
  web: {
    file: "mapa.js",
    code: `const LUGARES = [
${fmtLugares}
];

const voarPara = (lngLat) =>
  map.flyTo({ center: lngLat, zoom: 14, duration: 4000 });

// Um marcador por lugar: popup + voar até ele no clique
for (const l of LUGARES) {
  const marker = new maplibregl.Marker({ color: "#e11d48" })
    .setLngLat(l.lngLat)
    .setPopup(new maplibregl.Popup({ offset: 30 }).setText(l.nome))
    .addTo(map);
  marker.getElement().addEventListener("click", () => voarPara(l.lngLat));
}

// Botões de cidade: <button onclick="voarPara([-45.3578, -23.7774])">Ilhabela</button>

// Marcador arrastável
const morro = new maplibregl.Marker({ color: "#16a34a", draggable: true })
  .setLngLat([${MORRO.join(", ")}])
  .addTo(map);
morro.on("dragend", () => console.log(morro.getLngLat()));

// Funções de câmera ficam no próprio map
map.easeTo({ pitch: 60, zoom: 16, duration: 1500 });       // inclinar
map.rotateTo(map.getBearing() + 180, { duration: 3000 });  // girar
map.fitBounds([[${LITORAL_NORTE[0].join(", ")}], [${LITORAL_NORTE[1].join(", ")}]]);  // Litoral Norte
map.easeTo({ pitch: 0, bearing: 0, duration: 1000 });      // vista de cima`,
  },
};

function CameraMap() {
  const mapRef = useRef<maplibregl.Map | null>(null);
  return (
    <LiveMap
      badge={<><MapPinned /> Clique nos marcadores · arraste o verde</>}
      options={{ style: LIBERTY, center: CARAGUA, zoom: 10 }}
      setup={(m) => {
        mapRef.current = m;
        for (const l of LUGARES) {
          const marker = new maplibregl.Marker({ color: "#e11d48" })
            .setLngLat(l.lngLat)
            .setPopup(new maplibregl.Popup({ offset: 30 }).setText(l.nome))
            .addTo(m);
          marker.getElement().addEventListener("click", () => m.flyTo({ center: l.lngLat, zoom: 14, pitch: 0, bearing: 0, duration: 4000 }));
        }
        const morro = new maplibregl.Marker({ color: "#16a34a", draggable: true })
          .setLngLat(MORRO)
          .setPopup(new maplibregl.Popup({ offset: 30 }).setText("Morro Santo Antônio — me arraste!"))
          .addTo(m);
        morro.on("dragend", () => {
          const p = morro.getLngLat();
          morro.getPopup()?.setText(`Solto em ${p.lat.toFixed(4)}, ${p.lng.toFixed(4)}`);
        });
        return () => { mapRef.current = null; };
      }}
    >
      <div className="map-buttons">
        {[{ nome: "Caraguatatuba", lngLat: CARAGUA }, ...LUGARES].map((l) => (
          <button key={l.nome} onClick={() => mapRef.current?.flyTo({ center: l.lngLat, zoom: 14, pitch: 0, bearing: 0, duration: 4000 })}><Plane /> {l.nome}</button>
        ))}
        <button onClick={() => mapRef.current?.easeTo({ pitch: 60, zoom: 16, duration: 1500 })}><Rotate3d /> Inclinar 3D</button>
        <button onClick={() => { const m = mapRef.current; m?.rotateTo(m.getBearing() + 180, { duration: 3000 }); }}><RotateCw /> Girar 180°</button>
        <button onClick={() => mapRef.current?.fitBounds(LITORAL_NORTE, { pitch: 0, bearing: 0 })}><Crop /> Litoral Norte</button>
        <button onClick={() => mapRef.current?.easeTo({ pitch: 0, bearing: 0, duration: 1000 })}><Navigation /> Vista de cima</button>
      </div>
    </LiveMap>
  );
}

/* ------------------------------------------------------------------ */
/* Passo 4 — eventos e consultas                                       */
/* ------------------------------------------------------------------ */
const stepEvents: Step = {
  title: "Reagir ao usuário: eventos",
  Icon: MousePointerClick,
  purpose: "Saber onde o usuário tocou, o que está desenhado ali e para onde ele moveu o mapa.",
  items: [
    { name: "onPress · onLongPress", kind: "evento", desc: "Toque: lngLat e point (pixel)" },
    { name: "onRegionDidChange", kind: "evento", desc: "Terminou de mover: center, zoom…" },
    { name: "queryRenderedFeatures()", kind: "função", desc: "O que está desenhado em um pixel" },
    { name: "getCenter() · getZoom()", kind: "função", desc: "Lê o estado atual via ref do <Map>" },
    { name: "touchRotate · dragPan", kind: "atributo", desc: "Liga/desliga gestos (touchPitch, touchZoom…)" },
  ],
  app: {
    file: "App.tsx",
    code: `import { useRef, useState } from "react";
import { Alert, Text, View } from "react-native";
import { Map, Camera, type MapRef } from "@maplibre/maplibre-react-native";

export default function App() {
  const map = useRef<MapRef>(null);
  const [info, setInfo] = useState("Toque no mapa");

  return (
    <View style={{ flex: 1 }}>
      <Map ref={map} style={{ flex: 1 }}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        touchRotate={false}      // desliga girar com dois dedos
        onPress={async (e) => {
          const { lngLat, point } = e.nativeEvent;
          const features = await map.current?.queryRenderedFeatures(point);
          const f = features?.find((f) => f.properties?.name);
          setInfo(\`\${f?.properties?.name ?? "sem nome"} · \${lngLat[1].toFixed(4)}, \${lngLat[0].toFixed(4)}\`);
        }}
        onLongPress={(e) => Alert.alert("Toque longo", e.nativeEvent.lngLat.join(", "))}
        onRegionDidChange={(e) => {
          const { center, zoom } = e.nativeEvent;
          console.log("moveu para", center, "zoom", zoom);
        }}
      >
        <Camera initialViewState={{ center: ${C}, zoom: 16 }} />
      </Map>
      <Text>{info}</Text>
    </View>
  );
}`,
  },
  web: {
    file: "mapa.js",
    code: `// Clique: coordenada + o que está desenhado naquele pixel
map.on("click", (e) => {
  const f = map.queryRenderedFeatures(e.point)
    .find((f) => f.properties.name);
  info.textContent = \`\${f?.properties.name ?? "sem nome"} · \` +
    \`\${e.lngLat.lat.toFixed(4)}, \${e.lngLat.lng.toFixed(4)}\`;
});

// Fim de qualquer movimento (arrastar, zoom, animação)
map.on("moveend", () => {
  console.log("moveu para", map.getCenter(), "zoom", map.getZoom());
});

// Liga/desliga gestos
map.dragRotate.disable();
map.touchZoomRotate.disableRotation();`,
  },
};

function EventsMap() {
  const [click, setClick] = useState("Clique em uma rua, loja ou praça");
  const [view, setView] = useState("");
  return (
    <LiveMap
      badge={<><MousePointerClick /> Clique e arraste o mapa</>}
      options={{ style: LIBERTY, center: CARAGUA, zoom: 16 }}
      setup={(m) => {
        const show = () => setView(`centro ${m.getCenter().lat.toFixed(4)}, ${m.getCenter().lng.toFixed(4)} · zoom ${m.getZoom().toFixed(1)}`);
        m.on("load", show);
        m.on("moveend", show);
        m.on("click", (e) => {
          const f = m.queryRenderedFeatures(e.point).find((x) => x.properties?.name);
          setClick(`${f?.properties?.name ?? "sem nome"} · ${e.lngLat.lat.toFixed(4)}, ${e.lngLat.lng.toFixed(4)}`);
        });
      }}
    >
      <div className="map-info">
        <div><b>onPress / click</b>{click}</div>
        <div><b>onRegionDidChange / moveend</b>{view || "…"}</div>
      </div>
    </LiveMap>
  );
}

/* ------------------------------------------------------------------ */
/* Passo 5 — GeoJSONSource + Layer                                     */
/* ------------------------------------------------------------------ */
const PONTOS_VIEW = { center: [-45.37, -23.612] as [number, number], zoom: 12.2 };
/** Tipos que ganham ícone próprio; os demais continuam como círculo. */
const ICONES: { tipo: string; Icon: LucideIcon; cor: string }[] = [
  { tipo: "museu", Icon: Landmark, cor: "#7c3aed" },
  { tipo: "mirante", Icon: Binoculars, cor: "#16a34a" },
];

/** Desenha um ícone do lucide dentro de um círculo colorido e devolve como imagem para map.addImage(). */
function iconImage(Icon: LucideIcon, cor: string): Promise<HTMLImageElement> {
  const inner = renderToStaticMarkup(<Icon size={24} color="#ffffff" strokeWidth={2.2} />).replace("<svg ", '<svg x="12" y="12" ');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><circle cx="24" cy="24" r="21" fill="${cor}" stroke="#ffffff" stroke-width="3"/>${inner}</svg>`;
  const img = new Image(48, 48);
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  return img.decode().then(() => img);
}

const stepGeoJson: Step = {
  extra: {
    file: "pontos.json",
    code: print(PONTOS, 0, true),
    note: "Cada ponto é uma Feature: coordinates em [longitude, latitude]; properties viram atributos lidos com [\"get\", \"tipo\"]. Dá para desenhar os seus em geojson.io.",
  },
  title: "Seus dados: GeoJSON + <Layer>",
  Icon: MapPin,
  purpose: "Pontos próprios desenhados pelo motor do mapa: praias como círculos; museu e mirante com ícones próprios.",
  items: [
    { name: "<GeoJSONSource>", kind: "componente", desc: "Seus dados: data, cluster, onPress" },
    { name: "<Layer>", kind: "componente", desc: "Como desenhar: circle, symbol, line, fill…" },
    { name: "<Images>", kind: "componente", desc: "Registra ícones por nome para camadas symbol" },
    { name: "paint · layout · filter", kind: "atributo", desc: "Cores · texto e icon-image · quais features" },
    { name: "onPress (source)", kind: "evento", desc: "Toque em uma feature: e.nativeEvent.features" },
  ],
  app: {
    file: "App.tsx",
    code: `import { Alert } from "react-native";
import {
  Map, Camera, GeoJSONSource, Layer, Images,
} from "@maplibre/maplibre-react-native";
import PONTOS from "./pontos.json"; // o arquivo da aba pontos.json

export default function App() {
  return (
    <Map style={{ flex: 1 }}
      mapStyle="https://tiles.openfreemap.org/styles/positron">
      <Camera initialViewState={{ center: [${PONTOS_VIEW.center.join(", ")}], zoom: ${PONTOS_VIEW.zoom} }} />

      {/* Registra os ícones (PNG em assets/) com um nome */}
      <Images images={{
        museu: require("./assets/icone-museu.png"),
        mirante: require("./assets/icone-mirante.png"),
      }} />

      <GeoJSONSource
        id="pontos"
        data={PONTOS as GeoJSON.FeatureCollection}
        onPress={(e) => {
          const p = e.nativeEvent.features[0]?.properties;
          if (p) Alert.alert(p.nome, p.tipo);
        }}
      >
        {/* Praias: círculo colorido */}
        <Layer id="pontos-circulo" type="circle"
          filter={["!", ["in", ["get", "tipo"], ["literal", ["museu", "mirante"]]]]}
          paint={{
            "circle-radius": 9,
            "circle-color": ["match", ["get", "tipo"],
              "praia", "#0284c7", "#e11d48"],
            "circle-stroke-width": 3,
            "circle-stroke-color": "#ffffff",
          }} />

        {/* Museu e mirante: ícone com o mesmo nome do tipo */}
        <Layer id="pontos-icone" type="symbol"
          filter={["in", ["get", "tipo"], ["literal", ["museu", "mirante"]]]}
          layout={{
            "icon-image": ["get", "tipo"],
            "icon-size": 0.66,
            "icon-allow-overlap": true,
          }} />

        <Layer id="pontos-nome" type="symbol"
          layout={{
            "text-field": ["get", "nome"],
            "text-font": ["Noto Sans Bold"],
            "text-size": 13,
            "text-offset": [0, 1.4],
            "text-anchor": "top",
          }}
          paint={{ "text-halo-color": "#ffffff", "text-halo-width": 2 }} />
      </GeoJSONSource>
    </Map>
  );
}`,
  },
  web: {
    file: "mapa.js",
    code: `import PONTOS from "./pontos.json"; // o arquivo da aba pontos.json
// (ou passe a URL direto: data: "/pontos.json")

const COM_ICONE = ["in", ["get", "tipo"], ["literal", ["museu", "mirante"]]];

map.on("load", async () => {
  // Registra os ícones com um nome
  map.addImage("museu", (await map.loadImage("/icones/museu.png")).data);
  map.addImage("mirante", (await map.loadImage("/icones/mirante.png")).data);

  map.addSource("pontos", { type: "geojson", data: PONTOS });

  // Praias: círculo colorido
  map.addLayer({
    id: "pontos-circulo", type: "circle", source: "pontos",
    filter: ["!", COM_ICONE],
    paint: {
      "circle-radius": 9,
      "circle-color": ["match", ["get", "tipo"], "praia", "#0284c7", "#e11d48"],
      "circle-stroke-width": 3,
      "circle-stroke-color": "#ffffff",
    },
  });

  // Museu e mirante: ícone com o mesmo nome do tipo
  map.addLayer({
    id: "pontos-icone", type: "symbol", source: "pontos",
    filter: COM_ICONE,
    layout: { "icon-image": ["get", "tipo"], "icon-allow-overlap": true },
  });

  map.addLayer({
    id: "pontos-nome", type: "symbol", source: "pontos",
    layout: {
      "text-field": ["get", "nome"],
      "text-font": ["Noto Sans Bold"],
      "text-size": 13,
      "text-offset": [0, 1.4],
      "text-anchor": "top",
    },
    paint: { "text-halo-color": "#ffffff", "text-halo-width": 2 },
  });

  // Clique em um ponto (círculo ou ícone) → popup
  map.on("click", ["pontos-circulo", "pontos-icone"], (e) => {
    const p = e.features[0].properties;
    new maplibregl.Popup()
      .setLngLat(e.lngLat)
      .setHTML(\`<b>\${p.nome}</b><br>\${p.tipo}\`)
      .addTo(map);
  });
});`,
  },
};

function setupPontos(map: maplibregl.Map) {
  const comIcone: maplibregl.ExpressionSpecification = ["in", ["get", "tipo"], ["literal", ICONES.map((i) => i.tipo)]];
  map.on("load", async () => {
    for (const i of ICONES) map.addImage(i.tipo, await iconImage(i.Icon, i.cor), { pixelRatio: 1.5 });
    map.addSource("pontos", { type: "geojson", data: PONTOS });
    map.addLayer({
      id: "pontos-circulo", type: "circle", source: "pontos",
      filter: ["!", comIcone],
      paint: {
        "circle-radius": 9,
        "circle-color": ["match", ["get", "tipo"], "praia", "#0284c7", "#e11d48"],
        "circle-stroke-width": 3,
        "circle-stroke-color": "#ffffff",
      },
    });
    map.addLayer({
      id: "pontos-icone", type: "symbol", source: "pontos",
      filter: comIcone,
      layout: { "icon-image": ["get", "tipo"], "icon-allow-overlap": true },
    });
    map.addLayer({
      id: "pontos-nome", type: "symbol", source: "pontos",
      layout: { "text-field": ["get", "nome"], "text-font": ["Noto Sans Bold"], "text-size": 13, "text-offset": [0, 1.4], "text-anchor": "top" },
      paint: { "text-halo-color": "#ffffff", "text-halo-width": 2 },
    });
    const layers = ["pontos-circulo", "pontos-icone"];
    map.on("click", layers, (e) => {
      const p = e.features?.[0]?.properties as { nome: string; tipo: string } | undefined;
      if (p) new maplibregl.Popup().setLngLat(e.lngLat).setHTML(`<b>${p.nome}</b><br>${p.tipo}`).addTo(map);
    });
    map.on("mouseenter", layers, () => (map.getCanvas().style.cursor = "pointer"));
    map.on("mouseleave", layers, () => (map.getCanvas().style.cursor = ""));
  });
}

/* ------------------------------------------------------------------ */
/* Passo 6 — RasterSource + propriedades dinâmicas                     */
/* ------------------------------------------------------------------ */
const SEAMARKS = "https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png";

const stepRaster: Step = {
  title: "Camadas extras: <RasterSource>",
  Icon: Layers,
  purpose: "Empilhar outra fonte por cima da base — aqui, boias e faróis do canal de São Sebastião — e mudar a camada em tempo real.",
  items: [
    { name: "<RasterSource>", kind: "componente", desc: "Tiles raster: tiles, tileSize, attribution" },
    { name: "<VectorSource>", kind: "componente", desc: "O mesmo para tiles vetoriais" },
    { name: "raster-opacity", kind: "atributo", desc: "Propriedade de paint da camada raster" },
    { name: "visibility", kind: "atributo", desc: "Propriedade de layout: visible · none" },
    { name: "setPaintProperty()", kind: "função", desc: "Web: muda uma camada que já existe" },
  ],
  app: {
    file: "App.tsx",
    code: `import { useState } from "react";
import { Button, View } from "react-native";
import { Map, Camera, RasterSource, Layer } from "@maplibre/maplibre-react-native";

export default function App() {
  const [visivel, setVisivel] = useState(true);
  const [opacidade, setOpacidade] = useState(1);

  return (
    <View style={{ flex: 1 }}>
      <Map style={{ flex: 1 }}
        mapStyle="https://tiles.openfreemap.org/styles/positron">
        <Camera initialViewState={{ center: ${C}, zoom: 11 }} />

        <RasterSource id="nautico"
          tiles={["${SEAMARKS}"]}
          tileSize={256}
          attribution="© OpenSeaMap">
          <Layer id="nautico" type="raster"
            paint={{ "raster-opacity": opacidade }}
            layout={{ visibility: visivel ? "visible" : "none" }} />
        </RasterSource>
      </Map>

      {/* Mudou o estado → o React atualiza a camada */}
      <Button title="Mostrar/ocultar" onPress={() => setVisivel(!visivel)} />
      <Button title="Opacidade 30%" onPress={() => setOpacidade(0.3)} />
    </View>
  );
}`,
  },
  web: {
    file: "mapa.js",
    code: `map.on("load", () => {
  map.addSource("nautico", {
    type: "raster",
    tiles: ["${SEAMARKS}"],
    tileSize: 256,
    attribution: "© OpenSeaMap",
  });
  map.addLayer({ id: "nautico", type: "raster", source: "nautico" });
});

// Funções que alteram uma camada já existente
map.setPaintProperty("nautico", "raster-opacity", 0.3);
map.setLayoutProperty("nautico", "visibility", "none");

// Remover de vez
map.removeLayer("nautico");
map.removeSource("nautico");`,
  },
};

function RasterMap() {
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [visible, setVisible] = useState(true);
  const opacity = (v: number) => mapRef.current?.setPaintProperty("nautico", "raster-opacity", v);
  return (
    <LiveMap
      badge={<><Anchor /> Positron + OpenSeaMap</>}
      options={{ style: `${OFM}/positron`, center: CARAGUA, zoom: 11 }}
      setup={(m) => {
        mapRef.current = m;
        m.on("load", () => {
          m.addSource("nautico", { type: "raster", tiles: [SEAMARKS], tileSize: 256, maxzoom: 18, attribution: "© OpenSeaMap" });
          m.addLayer({ id: "nautico", type: "raster", source: "nautico" });
        });
        return () => { mapRef.current = null; };
      }}
    >
      <div className="map-buttons">
        <button onClick={() => {
          mapRef.current?.setLayoutProperty("nautico", "visibility", visible ? "none" : "visible");
          setVisible(!visible);
        }}><Eye /> {visible ? "Ocultar" : "Mostrar"} boias</button>
        <button onClick={() => opacity(1)}><SunDim /> Opacidade 100%</button>
        <button onClick={() => opacity(0.3)}><SunDim /> Opacidade 30%</button>
      </div>
    </LiveMap>
  );
}

/* ------------------------------------------------------------------ */
/* Lista de slides                                                     */
/* ------------------------------------------------------------------ */
const stepSlide = (n: number, step: Step, map: () => ReactNode, notes: string): SlideDef => ({
  section: "Passo a passo",
  notes,
  Body: () => <StepSlide n={n} step={step} map={map()} />,
});

export const buildSlides: SlideDef[] = [
  {
    section: "Passo a passo",
    variant: "section",
    notes: "Agora vamos aprender a biblioteca construindo um mapa. Cada passo acrescenta uma peça: componente, atributo ou função — sempre com o mapa ao vivo e o código ao lado. Todos começam em Caraguatatuba.",
    Body: () => (
      <>
        <div className="num">04</div>
        <h2>Construindo um mapa, passo a passo</h2>
        <p>Cada passo acrescenta uma peça — componente, atributo ou função — com o mapa ao vivo e o código ao lado.</p>
      </>
    ),
  },
  {
    section: "Passo a passo",
    notes: "Comece pelo zoom (5 → 17) e pitch (0 → 60), mostrando o código mudando. Troque o center: a câmera voa. Coordenadas sempre em [longitude, latitude]. Etiquetas: azul = componente, verde = atributo, roxo = função, laranja = evento.",
    Body: CameraStepSlide,
  },
  stepSlide(2, stepLocation, () => <LocationMap />,
    "Clique em Minha localização: o navegador pede a permissão. Se ele não conseguir a posição (comum no Chrome do Linux, sem serviço de localização), o slide simula o ponto azul em Caraguatatuba. No app, a permissão vem do hook useForegroundPermissions e precisa do plugin do expo-location no app.json."),
  stepSlide(3, stepCamera, () => <CameraMap />,
    "Use os botões de cidade (Ilhabela, São Sebastião…) ou clique num marcador: popup + flyTo. Depois Litoral Norte para enquadrar tudo. Arraste o marcador verde. Depois Inclinar 3D e Girar. Marker/ViewAnnotation são Views do React: ótimos para poucos pontos; para milhares, use GeoJSONSource + Layer (passo 5)."),
  stepSlide(4, stepEvents, () => <EventsMap />,
    "Clique em uma loja ou rua: o nome vem de queryRenderedFeatures — só funciona porque o mapa é vetorial. Arraste e veja o moveend atualizar."),
  stepSlide(5, stepGeoJson, () => (
    <LiveMap badge={<><MousePointerClick /> Clique em um ponto</>} options={{ style: `${OFM}/positron`, ...PONTOS_VIEW }} setup={setupPontos} />
  ), "Mostre a aba pontos.json: é ali que entram os seus pontos (geojson.io ajuda a criar). Fonte + camadas: o mesmo modelo dos estilos. Praias são círculos; museu e mirante usam ícones registrados com <Images> (app) / addImage (web) e escolhidos por icon-image. A cor vem da expressão match sobre o atributo tipo — voltamos a ela na seção de Style JSON."),
  stepSlide(6, stepRaster, () => <RasterMap />,
    "Diferença de filosofia: no app, mudar o estado do React re-renderiza a camada; na web, chamamos setPaintProperty/setLayoutProperty. Dê zoom no canal de São Sebastião para ver as boias."),
];
