import {
  Camera as CameraIcon, Compass, Globe, LocateFixed, Map as MapIcon, Maximize, MousePointerClick,
  Navigation, Paintbrush, Rotate3d, Ruler, Search, Code, ZoomIn,
} from "lucide-react";
import { CodeTabs } from "../components/Code";
import { Callout, Card, I, Kicker } from "../components/ui";
import type { SlideDef } from "../deck/Deck";

export const apiSlides: SlideDef[] = [
  {
    section: "API",
    variant: "section",
    notes: "Visão geral da API.",
    Body: () => (
      <>
        <div className="num">04</div>
        <h2>Componentes, funções e atributos</h2>
        <p>As peças que você vai usar em 90% dos projetos.</p>
      </>
    ),
  },
  {
    section: "API",
    notes: "A tabela é um dicionário entre as duas plataformas. Na v11, o antigo MapView virou Map e os layers aceitam paint/layout iguais aos da Style Spec.",
    Body: () => (
      <>
        <Kicker Icon={Code}>React Native v11</Kicker>
        <h2>Componentes principais</h2>
        <table className="t">
          <thead><tr><th>Componente</th><th>Para que serve</th><th>Equivalente na web</th></tr></thead>
          <tbody>
            <tr><td><code>{"<Map>"}</code></td><td>A view do mapa; recebe o estilo e os eventos de toque</td><td><code>new maplibregl.Map()</code></td></tr>
            <tr><td><code>{"<Camera>"}</code></td><td>Posição, zoom, inclinação, rotação e animações</td><td><code>map.flyTo()</code>, <code>map.jumpTo()</code></td></tr>
            <tr><td><code>{"<UserLocation>"}</code></td><td>Ponto azul do usuário (precisão e direção)</td><td><code>GeolocateControl</code></td></tr>
            <tr><td><code>{"<GeoJSONSource>"}</code></td><td>Seus dados (pontos, linhas, polígonos), com cluster</td><td><code>map.addSource(id, {"{ type: \"geojson\" }"})</code></td></tr>
            <tr><td><code>{"<VectorSource>"}</code> · <code>{"<RasterSource>"}</code></td><td>Tiles vetoriais ou raster adicionais</td><td><code>map.addSource()</code></td></tr>
            <tr><td><code>{"<Layer>"}</code></td><td>Como desenhar uma fonte (<code>type</code>, <code>paint</code>, <code>layout</code>, <code>filter</code>)</td><td><code>map.addLayer()</code></td></tr>
            <tr><td><code>{"<ViewAnnotation>"}</code> · <code>{"<Callout>"}</code></td><td>Componentes React posicionados no mapa</td><td><code>maplibregl.Marker</code> · <code>Popup</code></td></tr>
            <tr><td><code>{"<Images>"}</code></td><td>Registra ícones para usar em camadas <code>symbol</code></td><td><code>map.addImage()</code></td></tr>
          </tbody>
        </table>
      </>
    ),
  },
  {
    section: "API",
    notes: "Na web os equivalentes são opções do construtor (dragPan, touchZoomRotate…) e eventos via map.on(\"click\" | \"moveend\" | \"load\" | \"error\").",
    Body: () => (
      <>
        <Kicker Icon={MapIcon}>{"<Map>"}</Kicker>
        <h2>Atributos e eventos do mapa</h2>
        <div className="cols-2 grow">
          <table className="t">
            <thead><tr><th>Prop</th><th>Função</th></tr></thead>
            <tbody>
              <tr><td><code>mapStyle</code></td><td>URL ou objeto do Style JSON (obrigatório)</td></tr>
              <tr><td><code>compass</code> · <code>compassPosition</code></td><td>Bússola e sua posição</td></tr>
              <tr><td><code>scaleBar</code></td><td>Barra de escala</td></tr>
              <tr><td><code>logo</code> · <code>attribution</code></td><td>Logo e créditos (mantenha os créditos!)</td></tr>
              <tr><td><code>dragPan</code> · <code>touchZoom</code></td><td>Liga/desliga arrastar e pinça</td></tr>
              <tr><td><code>touchRotate</code> · <code>touchPitch</code></td><td>Liga/desliga girar e inclinar</td></tr>
              <tr><td><code>contentInset</code></td><td>Margem para menus sobre o mapa</td></tr>
            </tbody>
          </table>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", minHeight: 0 }}>
            <table className="t">
              <thead><tr><th>Evento</th><th>Quando dispara</th></tr></thead>
              <tbody>
                <tr><td><code>onPress</code> · <code>onLongPress</code></td><td>Toque no mapa (lng/lat e pixel)</td></tr>
                <tr><td><code>onRegionDidChange</code></td><td>Usuário terminou de mover o mapa</td></tr>
                <tr><td><code>onDidFinishLoadingStyle</code></td><td>Estilo carregado — seguro adicionar camadas</td></tr>
                <tr><td><code>onDidFailLoadingMap</code></td><td>Erro de rede ou estilo inválido</td></tr>
              </tbody>
            </table>
            <Callout Icon={Search}>
              Via <I>ref</I>: <I>getCenter()</I>, <I>getZoom()</I>, <I>getBounds()</I>, <I>queryRenderedFeatures()</I>, <I>project()</I> / <I>unproject()</I>, <I>createStaticMapImage()</I>.
            </Callout>
          </div>
        </div>
      </>
    ),
  },
  {
    section: "API",
    notes: "flyTo faz o efeito avião: afasta, viaja e aproxima. easeTo é uma transição direta. Vamos ver os dois em ação na demo de câmera.",
    Body: () => (
      <>
        <Kicker Icon={CameraIcon}>{"<Camera>"}</Kicker>
        <h2>A câmera: para onde o mapa olha</h2>
        <div className="cols-2 grow">
          <div>
            <div className="cols-2" style={{ gap: "1rem" }}>
              <Card Icon={LocateFixed} title="center"><I>[lng, lat]</I> do centro da tela</Card>
              <Card Icon={ZoomIn} tone="teal" title="zoom">0 (planeta) até ~22 (nível de rua)</Card>
              <Card Icon={Rotate3d} tone="violet" title="pitch">Inclinação: 0° = de cima, 60° = perspectiva</Card>
              <Card Icon={Compass} tone="amber" title="bearing">Rotação em graus: 0 = norte para cima</Card>
            </div>
            <ul className="clean small mt-s">
              <li><I>initialViewState</I>: posição inicial, sem "prender" a câmera.</li>
              <li><I>trackUserLocation</I>: <I>"default"</I>, <I>"heading"</I> ou <I>"course"</I> — segue o usuário.</li>
              <li><I>minZoom</I>, <I>maxZoom</I>, <I>maxBounds</I>: limites.</li>
            </ul>
          </div>
          <CodeTabs
            app={{ file: "App.tsx", code: `const camera = useRef<CameraRef>(null);

<Camera
  ref={camera}
  initialViewState={{ center: [-46.63, -23.55], zoom: 14 }}
/>

// Animações pelo ref
camera.current?.flyTo({ center: [-43.18, -22.95], zoom: 12 });
camera.current?.easeTo({ center, zoom: 16, duration: 500 });
camera.current?.fitBounds([[-47, -24], [-46, -23]]);
camera.current?.zoomTo(10);

// Muda só inclinação/zoom, mantendo o centro
camera.current?.setStop({ pitch: 60, zoom: 17, duration: 800 });` }}
            web={{ file: "App.web.tsx", code: `const map = new maplibregl.Map({
  container: "map",
  style: STYLE,
  center: [-46.63, -23.55],
  zoom: 14,
  pitch: 0,
  bearing: 0,
});

// Animações
map.flyTo({ center: [-43.18, -22.95], zoom: 12 });
map.easeTo({ center, zoom: 16, duration: 500 });
map.fitBounds([[-47, -24], [-46, -23]]);
map.zoomTo(10);

// Muda só inclinação/zoom, mantendo o centro
map.easeTo({ pitch: 60, zoom: 17, duration: 800 });` }}
          />
        </div>
      </>
    ),
  },
  {
    section: "API",
    notes: "Controles são adicionados com map.addControl(controle, posição). Nos mapas desta apresentação você vê o NavigationControl no canto superior direito.",
    Body: () => (
      <>
        <Kicker Icon={Globe}>GL JS</Kicker>
        <h2>As funções mais usadas na web</h2>
        <div className="cols-3">
          <Card Icon={Paintbrush} title="Estilo e dados">
            <I>setStyle()</I> troca o mapa inteiro<br /><I>addSource()</I> · <I>addLayer()</I><br /><I>setPaintProperty()</I><br /><I>setFilter()</I><br /><I>getSource(id).setData()</I>
          </Card>
          <Card Icon={CameraIcon} tone="violet" title="Câmera">
            <I>flyTo()</I> · <I>easeTo()</I> · <I>jumpTo()</I><br /><I>fitBounds()</I><br /><I>rotateTo()</I><br /><I>getCenter()</I> · <I>getZoom()</I><br /><I>setTerrain()</I> (relevo 3D)
          </Card>
          <Card Icon={MousePointerClick} tone="teal" title="Interação">
            <I>on("load")</I><br /><I>on("click", camada, fn)</I><br /><I>on("moveend")</I><br /><I>queryRenderedFeatures()</I><br /><I>new Popup()</I> · <I>new Marker()</I>
          </Card>
        </div>
        <div className="cols-4 mt">
          <Card Icon={Navigation} tone="ink" title="NavigationControl">Zoom + bússola</Card>
          <Card Icon={LocateFixed} tone="ink" title="GeolocateControl">Ponto azul do usuário</Card>
          <Card Icon={Ruler} tone="ink" title="ScaleControl">Barra de escala</Card>
          <Card Icon={Maximize} tone="ink" title="FullscreenControl">Tela cheia</Card>
        </div>
      </>
    ),
  },
];

