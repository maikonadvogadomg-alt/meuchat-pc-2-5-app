# 📋 Plano do projeto: meuchat-pc (2) (5)

_Gerado em 23/11/2026, 15:19:32 — sem IA, lendo os arquivos._

## 📊 Visão geral
| Item | Valor |
|---|---|
| Arquivos | 84 |
| Linhas | 16.960 |
| Telas/páginas | 18 |
| Rotas do backend | 0 |
| Chamadas do app | 0 |
| Tabelas do banco | 0 |
| Variáveis de ambiente | 6 |

**Linguagens:** JavaScript (51), HTML (18), Markdown (7), Imagem (2), Outros (2), JSON (2), YAML (1), CSS (1)

## 💡 O que fazer (em ordem)
1. 🧹 Tirar a Replit de 13 arquivo(s) (🏗️ Preparar → Fazer tudo)
2. 🔐 Criar um .env.example com: DADOS_EM, LOCALAPPDATA, PONTE_BASE, PONTE_CODIGO, PONTE_PORTA, TESTE_SAIR (os valores você coloca no servidor, nunca no código)
3. 🚫 Criar .gitignore (não mandar node_modules ao GitHub)

## 🚀 Por onde começa
- `app/index.html`

## ⌨️ Comandos (package.json)
| Pasta | Comando | O que roda |
|---|---|---|
| . | `npm run programa` | `electron .` |
| . | `npm run exe` | `electron-builder --win nsis portable --x64 --publish never` |

## 📱 Telas e páginas
| Endereço | Arquivo |
|---|---|
| `app/ferramentas/analisador-v2.html` | app/ferramentas/analisador-v2.html |
| `app/ferramentas/analisador.html` | app/ferramentas/analisador.html |
| `app/ferramentas/caca-sql.html` | app/ferramentas/caca-sql.html |
| `app/ferramentas/cofre-config.html` | app/ferramentas/cofre-config.html |
| `app/ferramentas/colecionador-codigo.html` | app/ferramentas/colecionador-codigo.html |
| `app/ferramentas/comandos-termux.html` | app/ferramentas/comandos-termux.html |
| `app/ferramentas/conversor-imagem.html` | app/ferramentas/conversor-imagem.html |
| `app/ferramentas/desmontador-backup.html` | app/ferramentas/desmontador-backup.html |
| `app/ferramentas/detector-api.html` | app/ferramentas/detector-api.html |
| `app/ferramentas/divisor-html.html` | app/ferramentas/divisor-html.html |
| `app/ferramentas/juntador.html` | app/ferramentas/juntador.html |
| `app/ferramentas/leitor-universal.html` | app/ferramentas/leitor-universal.html |
| `app/ferramentas/monica-guia.html` | app/ferramentas/monica-guia.html |
| `app/ferramentas/monica-passo.html` | app/ferramentas/monica-passo.html |
| `app/ferramentas/montador-modulos.html` | app/ferramentas/montador-modulos.html |
| `app/ferramentas/procurar-substituir.html` | app/ferramentas/procurar-substituir.html |
| `app/index.html` | app/index.html |
| `electron/navegador.html` | electron/navegador.html |

## 🖥️ Rotas do backend
_Nenhum encontrado._

## 📡 O que o app pede ao servidor
_Nenhum encontrado._

## 🔌 O que falta no backend
✅ Tudo que o app chama tem rota no projeto (ou o app não usa servidor).

## 🗄️ Banco de dados
_Nenhuma tabela encontrada._

## 🔐 Variáveis de ambiente (configurar no servidor)
- `DADOS_EM`
- `LOCALAPPDATA`
- `PONTE_BASE`
- `PONTE_CODIGO`
- `PONTE_PORTA`
- `TESTE_SAIR`

_Só os nomes. Os valores (chaves, senhas) nunca vão no código nem no GitHub._

## 🤖 IA usada
- generativelanguage.googleapis.com
- api.groq.com
- console.groq.com
- openrouter.ai
- api.openai.com
- platform.openai.com
- api.anthropic.com
- console.anthropic.com

## 🌐 Serviços de fora que ele acessa
- abcdxyz.supabase.co
- aistudio.google.com
- api-dashboard.search.brave.com
- api.anthropic.com
- api.deepseek.com
- api.github.com
- api.groq.com
- api.openai.com
- api.perplexity.ai
- api.search.brave.com
- api.tavily.com
- app.tavily.com
- cdn.jsdelivr.net
- cdn.tailwindcss.com
- console.anthropic.com
- console.groq.com
- generativelanguage.googleapis.com
- github.com
- google.serper.dev
- meuchat.local
- ollama.com
- openapi.monica.im
- openrouter.ai
- platform.deepseek.com
- platform.monica.im
- platform.openai.com
- r.jina.ai
- raw.github.com
- raw.githubusercontent.com
- serper.dev
- shskwmhqxvkvsjifnyry.supabase.co
- stuartk.com
- stuk.github.io
- supabase.com
- unpkg.com
- www.perplexity.ai
- xxxx.supabase.co

## 📦 Peças principais (dependências)
`msedge-tts` · `ws`

## 🧹 Arquivos com coisa da Replit
- app/js/11-online.js
- app/js/12-nuvem.js
- app/js/13-aovivo.js
- app/js/14-entrada.js
- app/js/33-contextos.js
- app/js/38-codigos.js
- app/js/45-mesa.js
- app/js/lib/ferramentas-lista.js
- app/js/lib/guia-maikon.js
- app/js/lib/guia-versoes.js
- app/js/lib/playground-replit.js
- app/js/lib/reconhecer.js
- app/sw.js

## 🔁 Roteiro para recriar fora da Replit
1. Importar o projeto no Mini SK e tocar em 🏗️ Preparar → ✅ Fazer tudo (tira a Replit, cria os arquivos que faltam).
2. Não tem backend: o site sozinho basta (Netlify ou GitHub Pages).
3. Variáveis: cadastrar 6 variável(is) no servidor (lista acima).
4. Testar a prévia; se der erro, 🤖 Mandar os erros para a IA.
5. App: 📲 Instalável (PWA), 📦 APK ou 🖥️ Desktop (.exe) pelo 🏗️ Preparar.

## 🌳 Árvore de arquivos
```
├─ 📁 .github/
│  └─ 📁 workflows/
│     └─ programa-exe.yml
├─ 📁 app/
│  ├─ 📁 css/
│  │  └─ app.css
│  ├─ 📁 docs/
│  │  ├─ cacabug.md
│  │  ├─ laboratorio.md
│  │  ├─ meuchat.md
│  │  ├─ minisk.md
│  │  └─ sk-juridico-html.md
│  ├─ 📁 ferramentas/
│  │  ├─ analisador-v2.html
│  │  ├─ analisador.html
│  │  ├─ caca-sql.html
│  │  ├─ cofre-config.html
│  │  ├─ colecionador-codigo.html
│  │  ├─ comandos-termux.html
│  │  ├─ conversor-imagem.html
│  │  ├─ desmontador-backup.html
│  │  ├─ detector-api.html
│  │  ├─ divisor-html.html
│  │  ├─ juntador.html
│  │  ├─ leitor-universal.html
│  │  ├─ monica-guia.html
│  │  ├─ monica-passo.html
│  │  ├─ montador-modulos.html
│  │  └─ procurar-substituir.html
│  ├─ 📁 icons/
│  │  ├─ icon-192.png
│  │  └─ icon-512.png
│  ├─ 📁 js/
│  │  ├─ 📁 lib/
│  │  │  ├─ cofre-arquivo.js
│  │  │  ├─ ferramentas-lista.js
│  │  │  ├─ guia-maikon.js
│  │  │  ├─ guia-versoes.js
│  │  │  ├─ jszip.min.js
│  │  │  ├─ nuvem-neon.js
│  │  │  ├─ playground-replit.js
│  │  │  ├─ reconhecer.js
│  │  │  └─ segredos.js
│  │  ├─ 00-base.js
│  │  ├─ 10-banco.js
│  │  ├─ 11-online.js
│  │  ├─ 12-nuvem.js
│  │  ├─ 13-aovivo.js
│  │  ├─ 14-entrada.js
│  │  ├─ 16-ver-nuvem.js
│  │  ├─ 20-provedores.js
│  │  ├─ 30-memoria.js
│  │  ├─ 33-contextos.js
│  │  ├─ 34-guia.js
│  │  ├─ 35-jeito.js
│  │  ├─ 36-gasto.js
│  │  ├─ 37-arquivos.js
│  │  ├─ 38-codigos.js
│  │  ├─ 39-qr.js
│  │  ├─ 40-voz.js
│  │  ├─ 41-pronto.js
│  │  ├─ 42-testar.js
│  │  ├─ 43-links.js
│  │  ├─ 44-docs.js
│  │  ├─ 45-mesa.js
│  │  ├─ 50-internet.js
│  │  ├─ 60-previa.js
│  │  ├─ 70-texto.js
│  │  ├─ 80-chat.js
│  │  ├─ 85-config.js
│  │  ├─ 87-cofre.js
│  │  ├─ 90-backup.js
│  │  ├─ 91-restaurar.js
│  │  ├─ 95-ponte-lab.js
│  │  ├─ 99-app.js
│  │  ├─ janela-pc.js
│  │  └─ nuvem-embutida.js
│  ├─ index.html
│  ├─ LEIA-ME.txt
│  ├─ manifest.json
│  ├─ README.md
│  └─ sw.js
├─ 📁 electron/
│  ├─ instalar.nsh
│  ├─ main.cjs
│  ├─ navegador.html
│  ├─ ponte.cjs
│  ├─ preload-nav.cjs
│  ├─ preload.cjs
│  ├─ saude.cjs
│  ├─ terminal.cjs
│  └─ voz.cjs
├─ LEIA-ME.md
└─ package.json
```
