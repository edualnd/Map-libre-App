import { ArrowLeftRight, Ban, Download, FileCode2, Globe, LocateFixed, Scale, Smartphone, Terminal, TriangleAlert } from "lucide-react";
import { CodePanel, CodeTabs } from "../components/Code";
import { Callout, I, Kicker, WithIcon } from "../components/ui";
import type { SlideDef } from "../deck/Deck";

export const platformSlides: SlideDef[] = [
  {
    section: "Web × App",
    variant: "section",
    notes: "Agora a parte prática.",
    Body: () => (
      <>
        <div className="num">03</div>
        <h2>Web × App e instalação</h2>
        <p>Mesmo motor de estilos, duas formas de usar: imperativa no navegador e declarativa no React Native.</p>
      </>
    ),
  },
  {
    section: "Web × App",
    notes: "Os dois pontos que mais pegam na prática: (1) o Expo Go não serve, precisa de dev build; (2) CORS na web — vamos ver isso acontecendo na demo de Transporte.",
    Body: () => (
      <>
        <Kicker Icon={Scale}>Comparativo</Kicker>
        <h2>Web × App: o que muda?</h2>
        <table className="t">
          <thead>
            <tr><th></th><th><WithIcon Icon={Globe}>Web — MapLibre GL JS</WithIcon></th><th><WithIcon Icon={Smartphone}>App — MapLibre React Native</WithIcon></th></tr>
          </thead>
          <tbody>
            <tr><td>Pacote</td><td><code>maplibre-gl</code></td><td><code>@maplibre/maplibre-react-native</code> → MapLibre Native (C++)</td></tr>
            <tr><td>Renderização</td><td>WebGL 2 no navegador</td><td>OpenGL ES ou Vulkan (Android) · Metal (iOS)</td></tr>
            <tr><td>Estilo de API</td><td>Imperativa: <code>new Map()</code>, <code>map.addLayer()</code>, <code>map.on()</code></td><td>Declarativa: <code>{"<Map>"}</code>, <code>{"<Camera>"}</code>, <code>{"<Layer>"}</code></td></tr>
            <tr><td>Instalação</td><td><code>npm</code> ou uma tag <code>{"<script>"}</code> da CDN</td><td>Código nativo → precisa de <b>development build</b>; não roda no Expo Go</td></tr>
            <tr><td>Localização</td><td><code>navigator.geolocation</code> + <code>GeolocateControl</code> (exige HTTPS)</td><td>GPS nativo: <code>expo-location</code> + <code>{"<UserLocation>"}</code></td></tr>
            <tr><td>Rede</td><td>Sujeito a <b>CORS</b> — o servidor de tiles precisa permitir</td><td>Sem CORS — qualquer servidor HTTP funciona</td></tr>
            <tr><td>Distribuição</td><td>Uma URL — atualiza na hora</td><td>APK / AAB / IPA via EAS e lojas</td></tr>
          </tbody>
        </table>
      </>
    ),
  },
  {
    section: "Web × App",
    notes: "Mesmos parâmetros, filosofias diferentes. No app, o estado do React controla o mapa; na web, você manda comandos para um objeto.",
    Body: () => (
      <>
        <Kicker Icon={ArrowLeftRight}>Lado a lado</Kicker>
        <h2>O mesmo mapa nas duas APIs</h2>
        <div className="cols-2 grow">
          <CodePanel title="App — declarativo" icon={<Smartphone />} file="App.tsx" blocks={[{ lang: "typescript", code: `import { Map, Camera, UserLocation }
  from "@maplibre/maplibre-react-native";

export default function App() {
  return (
    <Map
      style={{ flex: 1 }}
      mapStyle="https://tiles.openfreemap.org/styles/liberty"
    >
      <Camera initialViewState={{
        center: [-46.63, -23.55],  // [lng, lat]
        zoom: 14,
      }} />
      <UserLocation />
    </Map>
  );
}` }]} />
          <CodePanel title="Web — imperativo" icon={<Globe />} file="App.web.tsx" blocks={[{ lang: "typescript", code: `import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const map = new maplibregl.Map({
  container: "map",            // <div id="map">
  style: "https://tiles.openfreemap.org/styles/liberty",
  center: [-46.63, -23.55],    // [lng, lat]
  zoom: 14,
});

map.addControl(new maplibregl.GeolocateControl({
  trackUserLocation: true,     // ponto azul
}));` }]} />
        </div>
        <Callout Icon={TriangleAlert} tone="teal" className="mt-s">
          Nos dois casos as coordenadas são <b>[longitude, latitude]</b> — a ordem do GeoJSON. Inverter é o erro nº 1 (o mapa vai parar no oceano).
        </Callout>
      </>
    ),
  },
  {
    section: "Web × App",
    notes: "A opção B é a forma mais rápida de testar. Estes slides usam a opção A (npm + Vite + React). No nosso projeto Expo, a web também usa a opção A dentro de App.web.tsx.",
    Body: () => (
      <>
        <Kicker Icon={Download}>Instalação · Web</Kicker>
        <h2>Na web: npm ou uma tag &lt;script&gt;</h2>
        <div className="cols-2 grow">
          <CodePanel title="Opção A — npm (com bundler)" icon={<Terminal />} blocks={[
            { lang: "bash", code: "npm install maplibre-gl" },
            { lang: "typescript", code: `import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

new maplibregl.Map({
  container: "map",
  style: "https://tiles.openfreemap.org/styles/positron",
  center: [-46.63, -23.55],
  zoom: 12,
});` },
          ]} />
          <CodePanel title="Opção B — CDN (HTML puro)" icon={<FileCode2 />} blocks={[{ lang: "xml", code: `<link rel="stylesheet"
  href="https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.css">
<script
  src="https://unpkg.com/maplibre-gl@5.24.0/dist/maplibre-gl.js">
</script>

<div id="map" style="height: 100vh"></div>

<script>
  new maplibregl.Map({
    container: "map",
    style: "https://tiles.openfreemap.org/styles/liberty",
    center: [-46.63, -23.55],
    zoom: 12,
  });
</script>` }]} />
        </div>
        <Callout Icon={TriangleAlert} tone="amber" className="mt-s">
          A <I>div</I> precisa ter altura definida, senão o mapa fica invisível.
        </Callout>
      </>
    ),
  },
  {
    section: "Web × App",
    notes: "O config plugin injeta a configuração nativa (Gradle, Podfile) durante o build — você nunca edita as pastas android/ios à mão. O npx expo install resolve versões compatíveis com o SDK.",
    Body: () => (
      <>
        <Kicker Icon={Smartphone}>Instalação · App (Expo)</Kicker>
        <h2>No app: Expo + config plugin</h2>
        <div className="cols-2 grow">
          <CodePanel title="Terminal" icon={<Terminal />} blocks={[{ lang: "bash", code: `# 1. Criar o projeto (TypeScript)
npx create-expo-app@latest meu-mapa \\
  --template blank-typescript
cd meu-mapa

# 2. Instalar com versões compatíveis com o SDK
npx expo install @maplibre/maplibre-react-native \\
  expo-location expo-dev-client

# 3. Gerar e instalar o app de desenvolvimento
npx eas-cli@latest build -p android \\
  --profile development

# 4. Rodar o servidor e abrir no celular
npx expo start` }]} />
          <CodePanel title="app.json" icon={<FileCode2 />} blocks={[{ lang: "json", code: `{
  "expo": {
    "android": {
      "package": "com.duda.maplibreapp",
      "permissions": [
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION"
      ]
    },
    "plugins": [
      "@maplibre/maplibre-react-native",
      ["expo-location", {
        "locationWhenInUsePermission":
          "Usamos sua localização para centralizar o mapa."
      }]
    ]
  }
}` }]} />
        </div>
        <Callout Icon={Ban} tone="rose" className="mt-s">
          <b>Expo Go não funciona</b>: o MapLibre traz código nativo. Use o <i>development build</i> (passo 3) ou gere o APK. A v11 exige a <b>Nova Arquitetura</b> do React Native (padrão no Expo SDK 52+).
        </Callout>
      </>
    ),
  },
  {
    section: "Web × App",
    notes: "Mostre a troca de abas App/Web aqui — a escolha vale para todos os slides seguintes.",
    Body: () => (
      <>
        <Kicker Icon={LocateFixed}>Permissões</Kicker>
        <h2>Localização do usuário</h2>
        <div className="cols-2 grow">
          <CodeTabs
            app={{ file: "App.tsx", code: `import * as Location from "expo-location";

const [location, setLocation] = useState<[number, number] | null>(null);

useEffect(() => {
  (async () => {
    // 1. Pede permissão em tempo de execução (obrigatório!)
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return; // usa um local padrão

    // 2. Lê o GPS
    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    setLocation([pos.coords.longitude, pos.coords.latitude]);
  })();
}, []);

// 3. No JSX: ponto azul com círculo de precisão
<UserLocation accuracy heading />` }}
            web={{ file: "App.web.tsx", code: `// O navegador pede a permissão sozinho
const geolocate = new maplibregl.GeolocateControl({
  positionOptions: { enableHighAccuracy: true },
  trackUserLocation: true,   // segue o usuário
  showAccuracyCircle: true,
});
map.addControl(geolocate, "bottom-right");

// Centraliza assim que o mapa terminar de carregar
map.on("load", () => geolocate.trigger());

geolocate.on("geolocate", (e) => {
  console.log(e.coords.latitude, e.coords.longitude);
});

// Atenção: só funciona em HTTPS (ou localhost)` }}
          />
          <div>
            <ul className="clean">
              <li><b>App:</b> declarar no <I>app.json</I> <i>e</i> pedir em tempo de execução. Sem o pedido, o mapa abre no lugar errado.</li>
              <li><b>Web:</b> o <I>GeolocateControl</I> chama <I>navigator.geolocation</I> e desenha o ponto azul.</li>
              <li>Sempre tenha um <b>fallback</b> (ex.: centro de São Paulo) se o usuário negar.</li>
            </ul>
            <Callout Icon={LocateFixed} className="mt-s">
              No nosso app: <I>getLastKnownPositionAsync()</I> primeiro (instantâneo) e depois <I>getCurrentPositionAsync()</I> (preciso).
            </Callout>
          </div>
        </div>
      </>
    ),
  },
];
