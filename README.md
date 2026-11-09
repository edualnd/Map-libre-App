# 🗺️ MapLibre App

App multiplataforma (**Android, iOS e Web**) feito com **Expo + MapLibre** que mostra sua localização em **13 mapas com finalidades diferentes** — tudo gratuito, sem API key.

| | Mapa | Para que serve |
|---|---|---|
| 🏪 | Ruas e Lojas | Ruas, números, lojas, restaurantes e POIs (vetorial) |
| 🛰️ | Satélite | Foto aérea com ruas e nomes por cima |
| 🏙️ | Prédios 3D | Edifícios em 3D com câmera inclinada |
| 🤍 | Minimalista | Mapa limpo e claro |
| ⛰️ | Topográfico | Curvas de nível e trilhas |
| 🗻 | Relevo | Sombreamento do terreno (dados de elevação) |
| 🧭 | Explorador | Estilo National Geographic: parques e reservas |
| 🚲 | Ciclismo | Ciclovias, bicicletários e oficinas |
| 🚌 | Transporte | Linhas e paradas de ônibus, metrô e trem |
| 🚆 | Ferrovias | Trilhos, estações e linhas ferroviárias |
| ⚓ | Náutico | Profundidade, boias, faróis e sinalização marítima |
| 🏥 | Serviços | Hospitais, escolas, água e serviços essenciais |
| 🌙 | Noturno | Mapa escuro para usar à noite |

Para adicionar/remover mapas, edite a lista em [`mapModes.ts`](mapModes.ts).

---

## 📦 Estrutura

```
App.tsx         → app Android/iOS (@maplibre/maplibre-react-native)
App.web.tsx     → app Web (maplibre-gl JS) — usado automaticamente no navegador
mapModes.ts     → lista dos 13 mapas (compartilhada entre as plataformas)
app.json        → config do Expo: plugins do MapLibre/expo-location e permissões
eas.json        → perfis de build na nuvem (APK, iOS, etc.)
```

**Versões:** Expo SDK 58 · React Native 0.88 (Nova Arquitetura) · MapLibre React Native 11 · maplibre-gl 6.

---

## 1. Pré-requisitos

- [Node.js](https://nodejs.org) 20 ou mais novo (`node -v`)
- Uma conta gratuita em [expo.dev](https://expo.dev) (para gerar o APK na nuvem)
- Para iOS em aparelho físico: conta Apple Developer (paga)

> ⚠️ Este app **não funciona no Expo Go**, porque o MapLibre tem código nativo. Use um *development build* ou o APK (passos abaixo).

## 2. Baixar o projeto e instalar dependências

```bash
git clone <url-do-repositório> Map-libre-App   # ou copie a pasta
cd Map-libre-App
npm install
```

---

## 3. ⚡ Jeito mais rápido: rodar no navegador (Web)

Não precisa de celular nem de build:

```bash
npx expo start --web
```

Abre em `http://localhost:8081`. O navegador vai pedir permissão de localização.

---

## 4. 📱 Gerar o APK para instalar no Android (sem Android Studio)

O build roda na nuvem da Expo (grátis). Use `npx eas-cli@latest` — **não precisa** de `npm install -g` (que dá erro `EACCES` sem sudo).

```bash
npx eas-cli@latest login                                   # entra na sua conta expo.dev
npx eas-cli@latest build:configure                         # só na primeira vez
npx eas-cli@latest build -p android --profile preview      # gera o .apk
```

Ao terminar (~10–20 min), aparece um **link e um QR code**. Abra no celular, baixe o `.apk` e instale
(permita *"instalar apps de fontes desconhecidas"*).

> Quer usar só `eas` em vez de `npx eas-cli@latest`? Instale sem sudo:
> ```bash
> mkdir -p ~/.npm-global && npm config set prefix ~/.npm-global
> echo 'export PATH="$HOME/.npm-global/bin:$PATH"' >> ~/.bashrc && source ~/.bashrc
> npm install -g eas-cli
> ```

---

## 5. 🔧 Desenvolver no celular com atualização ao vivo

1. Gere e instale **uma vez** o app de desenvolvimento:
   ```bash
   npx eas-cli@latest build -p android --profile development
   ```
2. No computador, inicie o servidor:
   ```bash
   npx expo start
   ```
3. Abra o app instalado no celular (mesma rede Wi-Fi) e escaneie o QR code.
   Cada vez que você salvar `App.tsx` ou `mapModes.ts`, o app atualiza na hora.

---

## 6. 🍎 iOS

| Objetivo | Comando |
|---|---|
| Rodar no **simulador** (precisa de Mac) | `npx eas-cli@latest build -p ios --profile ios-simulator` ou `npx expo run:ios` |
| Instalar no **iPhone** (precisa de conta Apple Developer) | `npx eas-cli@latest build -p ios --profile preview` |

---

## 7. 🖥️ Build local (opcional, sem nuvem)

Precisa do [Android Studio](https://developer.android.com/studio) instalado (traz o Android SDK e o emulador):

```bash
npx expo run:android            # compila e abre no emulador ou celular via USB
```

Para gerar o APK localmente com o EAS: `npx eas-cli@latest build -p android --profile preview --local`.

---

## 🧰 Comandos úteis

```bash
npx expo start            # servidor de desenvolvimento
npx expo start --web      # abre a versão web
npx tsc --noEmit          # checa os tipos
npx expo lint             # lint
npx expo-doctor           # diagnostica problemas de config/dependências
npx expo install --fix    # corrige versões incompatíveis
```

## ❓ Problemas comuns

- **Mapa cinza / vazio** → sem internet, ou o servidor de tiles daquele mapa está fora do ar. Troque de mapa.
- **Não centraliza em mim** → ligue o GPS e aceite a permissão de localização. Sem permissão, o mapa abre em São Paulo.
- **App fecha ao abrir pelo Expo Go** → normal: use o APK ou o development build (seções 4 e 5).
- **`EACCES` no `npm install -g`** → use `npx eas-cli@latest` (seção 4).
- **Web: `Worker failed to load`** → rode `npm install` (ou `npm run postinstall`) para copiar o worker do maplibre-gl para `public/`, e reinicie o `npx expo start --web`.
- **Web: mapa "Transporte" diferente** → o servidor ÖPNVKarte bloqueia navegadores (CORS); na web ele usa um mapa alternativo com estações e linhas. No celular funciona normalmente.

## 📜 Créditos dos mapas

Dados © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors · [OpenFreeMap](https://openfreemap.org) · Esri · [OpenTopoMap](https://opentopomap.org) · [CyclOSM](https://www.cyclosm.org) · [ÖPNVKarte](https://www.öpnvkarte.de) · [OpenRailwayMap](https://www.openrailwaymap.org) · [OpenSeaMap](https://openseamap.org) · HOT/OSM France · AWS Terrain Tiles.

Os servidores comunitários de tiles são para **uso pessoal/leve**. Para publicar o app com muitos usuários, use um provedor próprio ou pago.
