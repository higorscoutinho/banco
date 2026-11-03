# DigiPLUS · overlay de zoeira para OBS

Banco fictício. Dois arquivos de tela:
- `index.html` → **Fonte de navegador** do OBS (fundo transparente, 1920x1080)
- `painel.html` → seu controle (abra no celular ou no PC)

## Subir no GitHub Pages
1. Crie um repositório (ex: `digiplus`) e envie todos os arquivos desta pasta.
2. Settings → Pages → Branch `main` / root.
3. URLs: `https://SEUUSER.github.io/digiplus/index.html` e `.../painel.html`

## Controlar de outro aparelho (celular → OBS)
Abra `config.js` e cole a `databaseURL` do Firebase Realtime Database
(o mesmo projeto das doações, ex: `https://doacoes-obs-default-rtdb.firebaseio.com`).
Regras do banco precisam permitir leitura/escrita em `digiplus` (como nas doações).
Painel e overlay devem usar a mesma sala: `?room=sala1` (padrão).

Sem a URL, só funciona no mesmo navegador (modo teste).

## No OBS
Fonte → Navegador → URL do `index.html` · largura 1920 · altura 1080 · deixe o CSS personalizado vazio.
Posição/tamanho do iPhone se ajustam no painel.

## Atalhos do painel
`→` ou espaço: próximo passo · `←`: voltar
