# Slides — MapLibre na Prática

Apresentação (~25 min, 47 slides) com mapas ao vivo e o código ao lado.

## Como abrir

- **Mais simples:** dê dois cliques em `index.html` (abre no navegador). Precisa de internet.
- **Servidor local (recomendado para apresentar):**
  ```bash
  npx serve slides        # ou: python3 -m http.server -d slides 8080
  ```
- **Publicar:** é um único arquivo estático — funciona no GitHub Pages, Netlify, Vercel etc.

## Atalhos

| Tecla | Ação |
|---|---|
| `→` `Espaço` / `←` | Próximo / anterior |
| `N` | Notas do apresentador |
| `F` | Tela cheia |
| `A` / `W` | Código **App (Android/iOS)** / **Web** em todos os slides |
| `T` | Zerar o cronômetro (fica amarelo aos 22 min e vermelho aos 25) |
| `?` | Ajuda |

O link guarda o slide atual (`index.html#27`).

## Como funciona

- Os mapas usam **MapLibre GL JS 5.24** via CDN (o build UMD já traz o worker embutido).
- Cada mapa é criado ao entrar no slide e destruído ao sair (o navegador limita os contextos WebGL).
- O código das demonstrações é **gerado a partir dos mesmos dados que desenham o mapa** (array `DEMOS`), então o que aparece na tela é exatamente o que roda.
- A aba padrão do código é **📱 App (Android/iOS)**; a aba **🌐 Web** mostra o equivalente em `maplibre-gl`.
- O mapa *Transporte* mostra o fallback web de propósito: o servidor ÖPNVKarte bloqueia navegadores (CORS).
