import {
  ArrowRight, Atom, Blocks, CalendarClock, CircleCheck, CircleHelp, CreditCard, FileJson, GitFork, Globe,
  KeyRound, Layers, Lightbulb, Lock, Package, Rocket, Scale, Server, Smartphone, Sparkles, Users,
} from "lucide-react";
import type maplibregl from "maplibre-gl";
import { LiveMap } from "../components/LiveMap";
import { Callout, Card, I, IconBox, Kicker } from "../components/ui";
import { OFM } from "../data/demos";
import type { SlideDef } from "../deck/Deck";

function spin(map: maplibregl.Map) {
  const rotate = () => map.rotateTo(map.getBearing() + 90, { duration: 24000, easing: (t) => t });
  map.on("load", rotate);
  map.on("moveend", rotate);
}

export const introSlides: SlideDef[] = [
  {
    section: "Abertura",
    variant: "cover",
    notes: "Boas-vindas. O mapa ao fundo já é MapLibre rodando no navegador, com prédios 3D da Av. Paulista. Hoje: o que é, como funciona, como instalar, diferenças web × app, API e 13 demonstrações ao vivo. Use ← → para navegar e N para notas.",
    Body: () => (
      <>
        <LiveMap
          controls={false}
          options={{ style: `${OFM}/liberty`, center: [-46.6565, -23.5618], zoom: 15.6, pitch: 62, bearing: -20, interactive: false }}
          setup={spin}
        />
        <div className="veil" />
        <div className="content">
          <Kicker>Tutorial · Mapas open source</Kicker>
          <h1>MapLibre<br />na Prática</h1>
          <p>Do zero a um app de mapas para <b>Android, iOS e Web</b> — sem API key e sem pagar por mapa carregado.</p>
          <div className="meta">
            <span><Blocks /> Expo SDK 58</span>
            <span><Atom /> React Native 0.88</span>
            <span><Smartphone /> MapLibre React Native 11</span>
            <span><Globe /> MapLibre GL JS</span>
          </div>
        </div>
      </>
    ),
  },
  {
    section: "Abertura",
    notes: "Explique o formato: tudo que aparece é interativo — dá para arrastar, dar zoom e girar os mapas. A aba escolhida (App/Web) vale para todos os slides.",
    Body: () => (
      <>
        <Kicker Icon={CalendarClock}>Roteiro · 25 minutos</Kicker>
        <h2>O que vamos ver</h2>
        <div className="agenda">
          <div><b>O que é o MapLibre e por que ele existe</b><i>3 min</i></div>
          <div><b>Como um mapa digital funciona: tiles e estilos</b><i>4 min</i></div>
          <div><b>Web × App e instalação passo a passo</b><i>4 min</i></div>
          <div><b>Principais componentes, funções e atributos</b><i>4 min</i></div>
          <div><b>Demonstrações: 13 mapas com 13 finalidades</b><i>8 min</i></div>
          <div><b>Build, armadilhas e próximos passos</b><i>2 min</i></div>
        </div>
        <Callout Icon={Lightbulb} className="mt">
          Em cada demonstração: <b>mapa ao vivo à esquerda</b> e, à direita, o código que gera aquele mapa — por padrão no formato <b>App (Android/iOS)</b>, com uma aba <b>Web</b> ao lado.
        </Callout>
      </>
    ),
  },
  {
    section: "O que é",
    variant: "section",
    notes: "Transição para a parte conceitual.",
    Body: () => (
      <>
        <div className="num">01</div>
        <h2>O que é o MapLibre?</h2>
        <p>Uma família de bibliotecas open source para desenhar mapas interativos — no navegador e em apps nativos.</p>
      </>
    ),
  },
  {
    section: "O que é",
    notes: "Não é que Google/Mapbox sejam ruins — mas para projetos acadêmicos, ONGs e startups, custo e dependência importam. MapLibre separa o motor (renderização) da gasolina (dados).",
    Body: () => (
      <>
        <Kicker Icon={CircleHelp}>Motivação</Kicker>
        <h2>Por que não usar só o Google Maps?</h2>
        <div className="cols-3">
          <Card Icon={CreditCard} tone="rose" title="Custo por uso">Serviços comerciais cobram por carregamento de mapa ou por requisição de tiles depois de uma cota gratuita.</Card>
          <Card Icon={KeyRound} tone="amber" title="Chave e conta">Exigem API key, cartão cadastrado e regras de uso que podem mudar a qualquer momento.</Card>
          <Card Icon={Lock} tone="violet" title="Aprisionamento">Estilo, dados e SDK amarrados a um fornecedor. Trocar depois significa reescrever o app.</Card>
        </div>
        <Callout Icon={CircleCheck} tone="teal" className="mt">
          <b>MapLibre:</b> o motor de renderização é livre (licença BSD). Você escolhe de onde vêm os dados — servidor próprio, provedor pago ou projetos gratuitos como <b>OpenFreeMap</b> e <b>OpenStreetMap</b>.
        </Callout>
      </>
    ),
  },
  {
    section: "O que é",
    notes: "Por ser um fork, quem conhece Mapbox reconhece quase toda a API. O mesmo JSON de estilo em todas as plataformas é o que permite nosso app compartilhar a lista de mapas entre web e celular.",
    Body: () => (
      <>
        <Kicker Icon={GitFork}>História</Kicker>
        <h2>Nasceu de um fork em 2020</h2>
        <div className="flow center" style={{ marginBottom: "2rem" }}>
          <div className="step"><IconBox Icon={Package} size="sm" /><b>Mapbox GL JS v1</b>Biblioteca open source (BSD), muito popular na web</div>
          <div className="arrow"><ArrowRight /></div>
          <div className="step"><IconBox Icon={Scale} size="sm" tone="amber" /><b>Dez/2020</b>A v2 passa a ter licença proprietária e exige conta Mapbox</div>
          <div className="arrow"><ArrowRight /></div>
          <div className="step"><IconBox Icon={GitFork} size="sm" tone="teal" /><b>Fork da v1.13</b>A comunidade cria o <b>MapLibre</b> para manter o código livre</div>
          <div className="arrow"><ArrowRight /></div>
          <div className="step"><IconBox Icon={Rocket} size="sm" tone="violet" /><b>Hoje</b>Projeto independente, com governança aberta e patrocínio de várias empresas</div>
        </div>
        <div className="cols-2">
          <ul className="clean">
            <li>O mesmo aconteceu com o <b>Mapbox GL Native</b> → <b>MapLibre Native</b> (Android, iOS, desktop).</li>
            <li>Desde então evoluiu muito: globo 3D, terreno, renderizadores Metal e Vulkan.</li>
          </ul>
          <ul className="clean">
            <li>Licença <b>BSD-3</b>: uso comercial liberado, sem royalties.</li>
            <li>Usa a <b>MapLibre Style Spec</b>: o mesmo JSON de estilo funciona em todas as plataformas.</li>
          </ul>
        </div>
      </>
    ),
  },
  {
    section: "O que é",
    notes: "Destaque os três que usamos: GL JS (web), Native (embaixo do RN) e o wrapper React Native. Martin é mencionado para quem quiser servir seus próprios dados.",
    Body: () => (
      <>
        <Kicker Icon={Layers}>Ecossistema</Kicker>
        <h2>Uma família de projetos</h2>
        <div className="cols-3">
          <Card Icon={Globe} title="MapLibre GL JS">Biblioteca TypeScript para navegadores. Renderiza com WebGL. Pacote <I>maplibre-gl</I>.</Card>
          <Card Icon={Smartphone} tone="teal" title="MapLibre Native">Motor em C++ para Android, iOS, Linux, Windows e macOS. OpenGL, Vulkan e Metal.</Card>
          <Card Icon={Atom} tone="violet" title="MapLibre React Native">Componentes React sobre o Native. Pacote <I>@maplibre/maplibre-react-native</I>.</Card>
          <Card Icon={FileJson} tone="amber" title="Style Spec">Especificação do JSON de estilo: fontes, camadas, expressões. Compartilhada por todos.</Card>
          <Card Icon={Server} tone="ink" title="Martin">Servidor de tiles vetoriais (Rust) a partir de PostGIS, MBTiles e PMTiles.</Card>
          <Card Icon={Users} tone="rose" title="Comunidade">Plugins, wrappers para Flutter, Compose, SwiftUI e integrações com ferramentas GIS.</Card>
        </div>
        <Callout Icon={Sparkles} className="mt">
          Neste projeto usamos <b>React Native (Expo)</b> no celular e <b>GL JS</b> no navegador — duas portas de entrada para o mesmo motor de estilos.
        </Callout>
      </>
    ),
  },
];

