import {
  ArrowLeftRight, BookOpen, Ban, Cloud, Cog, Cpu, FileCode2, FolderTree, Globe, Lock, MapPinned, PartyPopper,
  Rocket, ShieldAlert, Smartphone, Terminal, TriangleAlert, Workflow,
} from "lucide-react";
import { CodePanel } from "../components/Code";
import { Callout, Card, I, Kicker } from "../components/ui";
import type { SlideDef } from "../deck/Deck";

export const closingSlides: SlideDef[] = [
  {
    section: "Fechamento",
    variant: "section",
    notes: "Reta final.",
    Body: () => (
      <>
        <div className="num">06</div>
        <h2>Do código ao celular</h2>
        <p>Como o projeto está organizado, como gerar o APK e as armadilhas que encontramos no caminho.</p>
      </>
    ),
  },
  {
    section: "Fechamento",
    notes: "A extensão .web.tsx é resolvida automaticamente pelo Metro. Assim cada plataforma usa a biblioteca certa sem if/else espalhado pelo código.",
    Body: () => (
      <>
        <Kicker Icon={FolderTree}>Arquitetura do projeto</Kicker>
        <h2>Um catálogo, duas implementações</h2>
        <div className="cols-2 grow" style={{ alignItems: "start" }}>
          <div className="flow col">
            <div className="step" style={{ borderColor: "var(--accent)" }}><b><FileCode2 /> mapModes.ts</b>Lista dos 13 mapas: <I>id</I>, <I>label</I>, <I>mapStyle</I>, <I>pitch</I>, <I>web</I> (fallback)</div>
            <div className="row">
              <div className="step"><b><Smartphone /> App.tsx</b>Android + iOS<br /><I>{"<Map>"}</I> · <I>{"<Camera>"}</I> · <I>{"<UserLocation>"}</I> · <I>expo-location</I></div>
              <div className="step"><b><Globe /> App.web.tsx</b>Navegador<br /><I>new maplibregl.Map()</I> · <I>GeolocateControl</I></div>
            </div>
            <div className="step"><b><Cog /> app.json · eas.json</b>Config plugins, permissões e perfis de build (APK, iOS, simulador)</div>
          </div>
          <CodePanel title="mapModes.ts" blocks={[{ lang: "typescript", code: `export type MapMode = {
  id: string;
  label: string;
  icon: string;
  description: string;
  mapStyle: string | StyleSpecification;
  pitch?: number;   // ex.: 60 nos Prédios 3D
  zoom?: number;
  dark?: boolean;
  // Alternativa só para a web (ex.: servidor sem CORS)
  web?: { mapStyle: string | StyleSpecification;
          description: string };
};

// O Metro escolhe o arquivo pela plataforma:
//   App.tsx      → Android / iOS
//   App.web.tsx  → navegador` }]} />
        </div>
      </>
    ),
  },
  {
    section: "Fechamento",
    notes: "Use npx eas-cli@latest em vez de npm install -g para evitar o erro EACCES em Linux. O perfil production gera .aab para a Play Store.",
    Body: () => (
      <>
        <Kicker Icon={Cloud}>Build e distribuição</Kicker>
        <h2>Gerando o APK na nuvem com EAS</h2>
        <div className="cols-2 grow">
          <CodePanel title="Terminal" icon={<Terminal />} blocks={[{ lang: "bash", code: `# Login na conta gratuita do expo.dev
npx eas-cli@latest login

# Só na primeira vez
npx eas-cli@latest build:configure

# APK para instalar direto no Android
npx eas-cli@latest build -p android --profile preview

# iOS no simulador (ou --profile preview
# com conta Apple Developer)
npx eas-cli@latest build -p ios --profile ios-simulator

# Versão web estática (pasta dist/)
npx expo export -p web` }]} />
          <CodePanel title="eas.json" blocks={[{ lang: "json", code: `{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "ios-simulator": {
      "extends": "preview",
      "ios": { "simulator": true }
    }
  }
}` }]} />
        </div>
        <Callout Icon={Rocket} tone="teal" className="mt-s">
          Ao terminar (~10–20 min), o EAS mostra um link e um QR code: abra no celular, baixe o <I>.apk</I> e instale. Não precisa de Android Studio.
        </Callout>
      </>
    ),
  },
  {
    section: "Fechamento",
    notes: "Todas essas aconteceram de verdade durante o desenvolvimento deste app — vale contar a história de cada uma.",
    Body: () => (
      <>
        <Kicker Icon={TriangleAlert}>Lições aprendidas</Kicker>
        <h2>Armadilhas que encontramos</h2>
        <div className="cols-3">
          <Card Icon={Ban} tone="rose" title="Expo Go">O app fecha ou não mostra o mapa. MapLibre tem código nativo → use development build ou APK.</Card>
          <Card Icon={Cpu} tone="violet" title="Nova Arquitetura">MapLibre RN v11 exige a New Architecture. Use Expo SDK 52 ou mais novo.</Card>
          <Card Icon={Workflow} tone="amber" title="Worker da GL JS v6">"Worker failed to load" no Metro. Solução: servir o worker por <I>public/</I> e chamar <I>setWorkerUrl()</I>.</Card>
          <Card Icon={ShieldAlert} tone="rose" title="CORS na web">Servidor sem <I>Access-Control-Allow-Origin</I> → tiles bloqueados. No app funciona. Solução: fallback por plataforma.</Card>
          <Card Icon={Lock} tone="ink" title="EACCES no npm -g">Instalar global exige root no Linux. Use <I>npx eas-cli@latest</I> ou mude o prefixo do npm.</Card>
          <Card Icon={ArrowLeftRight} tone="teal" title="[lng, lat]">A ordem é longitude, latitude. Invertido, o mapa abre no meio do oceano.</Card>
        </div>
      </>
    ),
  },
  {
    section: "Fechamento",
    variant: "section",
    notes: "Resumo: MapLibre = motor livre; dados você escolhe; mesmo estilo em web e app; Expo + EAS para gerar o APK sem Android Studio.",
    Body: () => (
      <>
        <div className="num"><PartyPopper /></div>
        <h2>Obrigado! Perguntas?</h2>
        <div className="cols-2" style={{ maxWidth: "80%", marginTop: "1rem" }}>
          <ul className="clean links">
            <li><BookOpen /><b style={{ color: "#fff" }}>maplibre.org</b> — documentação e exemplos</li>
            <li><FileCode2 /><b style={{ color: "#fff" }}>maplibre.org/maplibre-style-spec</b></li>
            <li><MapPinned /><b style={{ color: "#fff" }}>openfreemap.org</b> — tiles vetoriais grátis</li>
          </ul>
          <ul className="clean links">
            <li><Smartphone /><b style={{ color: "#fff" }}>github.com/maplibre/maplibre-react-native</b></li>
            <li><Rocket /><b style={{ color: "#fff" }}>docs.expo.dev</b> — Expo e EAS Build</li>
            <li><Globe /><b style={{ color: "#fff" }}>openstreetmap.org</b> — contribua com os dados!</li>
          </ul>
        </div>
      </>
    ),
  },
];
