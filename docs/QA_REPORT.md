# Relatório de QA

Somente testes realmente executados. Teste não feito é `NOT RUN`.

## TASK 00 — 2026-11-18

- Ambiente: Windows 11, Git Bash. Sem navegador (não aplicável a documentação).
- Executado: inspeção da pasta (`ls`, `git status`, `git remote`, `git branch`, `package.json`, README).
- Resultado: pasta contém o site anterior; árvore Git limpa; remoto `origin` = `MaxRbrt/Portfolio`.
- Consistência dos documentos: IDs de animação de `ANIMATIONS.md` batem com `REFERENCES.md` e `TASKS.md`;
  base `/Portfolio/` igual em `DECISIONS.md`, `TASKS.md` e `ARCHITECTURE.md`.
- Validação visual: NOT RUN (sem front nesta task).
- Typecheck, lint, testes, build: NOT RUN (sem código novo).
- Limitações: as metas de performance e acessibilidade ainda não foram medidas.

## TASK 01 — 2026-11-18

- Ambiente: Chrome do usuário com a extensão de automação, janela de cerca de 1536×770.
- Executado:
  - Abri os 4 tutoriais e li o texto de cada página.
  - Na demonstração R05, abri a galeria e acionei "Copy prompt". Interceptei o texto copiado e li
    apenas trechos.
  - Busquei "retrofuturist" na galeria e não houve resultado. Busquei "character" e achei o 3D
    Character Studio.
  - No R01, movi o cursor da esquerda para o centro e observei a cabeça girar em duas capturas.
- Evidências: capturas vistas na sessão, não salvas.
- Não verificado:
  - comportamento das referências no mobile;
  - seções abaixo do hero do R05;
  - código-fonte do R05, que é pago.
- Resultado: `REFERENCES.md` está preenchido com técnica, parâmetros, uso no portfólio e diferenças
  de cada referência.

## TASK 02 — 2026-11-18

- Contraste: recálculo por luminância relativa confirmou os valores de `DESIGN_SYSTEM.md`.
  O menor contraste entre os pares previstos para texto de corpo foi 6,90:1.
- Fontes: os dois pacotes instalados contêm licença SIL OFL 1.1. O build emitiu os WOFF2 locais.

## TASK 03 — 2026-11-18

- Ambiente: Windows, PowerShell, Node 24.18.0, Vite 8.3.8.
- `npm run typecheck`, `npm run lint` e `npm run build`: código de saída 0, em sequência.
- `npm test -- --maxWorkers=1`: código de saída 0 com `--passWithNoTests`. Zero arquivos de teste.
- Servidor local: a porta 5173 já estava ocupada pelo Vite. `/Portfolio/`,
  `/Portfolio/src/app/main.tsx` e `/Portfolio/src/styles/index.css` responderam HTTP 200.
- Build de produção: o HTML referencia JS e CSS sob `/Portfolio/assets/`, e ambos existem na saída
  temporária do build.
- Validação visual com Playwright e Chrome 157.0.8103.79. O H1 provisório e a fonte Inter Tight
  carregaram nos nove tamanhos de `TESTING.md`, de 320×640 a 1920×1080. Capturas de 320×640
  e 1440×900 foram inspecionadas.
- Defeito comprovado em 320 px: a fonte com mínimo de 56 px fez a linha mais longa do H1 medir
  324,48 px, com 280 px disponíveis entre margens. O texto ficou cortado à direita e a largura
  de rolagem chegou a 344 px. De 375 px a 1920 px, o título coube nos tamanhos testados.
- Console: sem exceções da aplicação. O Chrome solicitou `/favicon.ico` na primeira carga e
  recebeu 404. O HTML ainda não declara favicon, previsto na TASK 14.
- Correção: o título provisório mantém o token de tamanho com um teto de `15vw`. A mesma
  checagem de regressão falhou antes em 320, 340 e 360 px e passou depois nas 11 larguras
  testadas. Em 320 px, a fonte ficou em 48 px, o título coube entre as margens e a largura de
  rolagem voltou a 320 px. A partir de 375 px, o tamanho original foi preservado.
- Revisão após a correção: capturas de 320×640 e 1440×900 inspecionadas. Typecheck, lint,
  Prettier do CSS e build concluídos. A regra foi conferida no CSS gerado. Fora o 404 conhecido
  do favicon, a nova checagem não registrou erros de console ou rede.

## TASK 04 — 2026-11-18

- Typecheck, lint dos arquivos TypeScript alterados, Prettier e build passaram. O Vitest passou
  em cinco cenários de seleção da seção ativa. O arquivo de testes temporário foi removido.
- Playwright com Chrome 157.0.8103.79: cinco âncoras e retorno ao início, navegação pelo
  histórico, link direto e recarga, indicador da seção durante a rolagem e tema do cabeçalho.
  Link de salto com foco visível no tema claro e ativação por Enter verificados.
- Menu: abertura por teclado e ponteiro, primeiro link em foco, ciclo Tab e Shift+Tab, Escape e
  botão Fechar com retorno do foco, seleção de seção com foco no destino, rolagem bloqueada e
  liberação ao mudar para desktop. Movimento reduzido sem animação e painel com rolagem própria
  em 320×400 verificados.
- Layout: sem rolagem horizontal em 320, 375, 768, 1023, 1024, 1440 e 1920 px. Capturas de
  375×667 e 1440×900 inspecionadas. Contraste do texto do cabeçalho de 21:1 no escuro e
  18,76:1 no claro. Auditoria visual estática sem achados nos 18 critérios executados.
- Uma instância antiga do Vite servia CSS desatualizado. A validação usou uma instância nova,
  encerrada ao final. No link direto, o navegador tentava a rolagem antes da montagem do React.
  A inicialização passou a posicionar a âncora quando a página ainda está no topo. A reprodução
  em `#projetos` falhou antes da correção e passou depois.
- Pendências fora desta etapa: conferir o cabeçalho sobre o canvas na TASK 05. O 404 do favicon
  continua registrado na TASK 14. Nenhum outro erro de console ou rede apareceu nos testes.

## TASK 05 — 2026-11-18

- Revisão da entrega anterior: busto em WebGL com cursor, redimensionamento, movimento reduzido e
  fallback sem WebGL já validados, com typecheck, lint, build e sete testes temporários do Vitest.
- Ajustes da revisão:
  - `lang="en"` no H1.
  - Camada interna `.hero-arte-palco`, para que a entrada e a rolagem não disputem o mesmo
    `transform`.
- Cabeçalho sobre o canvas conferido no Chrome: links clicáveis, porque o canvas tem
  `pointer-events: none`.
- Pendente: Lighthouse, na TASK 13. Aviso de chunk 3D de 967 kB, com 257 kB em gzip, também na
  TASK 13.

## TASK 06 — 2026-11-18

- `npm run typecheck`, `npm run lint` e `npm run build`: código de saída 0, em sequência.
- Desktop, 1920×1080 no Chrome:
  - pin ativo (`.pin-spacer` presente);
  - a 35%, o título sai e o busto vai para a direita;
  - a 72–78%, a frase aparece à esquerda e o busto fica de perfil à direita;
  - depois, o pin solta para o Sobre.
- Volta ao topo: título com opacidade 1. A linha do tempo é reversível.
- Celular, em iframe de 390×844:
  - sem pin e sem canvas;
  - a frase revela as linhas ao entrar na tela;
  - largura de rolagem dentro da tela.
- Console sem erros após recarga. Os erros vistos durante a edição vieram do HMR com arquivo
  incompleto e sumiram depois de recarregar.
- Correção: deslocamento do busto de 22vw para 16vw. A 72%, ele era cortado pela borda do
  container.
- NOT RUN:
  - movimento reduzido emulado no navegador. Coberto pelo código: nenhuma media query do GSAP
    casa, então a frase fica estática;
  - rolagem rápida com trackpad real.

## TASKS 07 a 11 — 2026-11-18

- `npm run typecheck`, `npm run lint` e `npm run build`: código de saída 0, em sequência. O aviso
  do chunk 3D continua, para a TASK 13.
- Revelação na rolagem (`useRevelacaoAoEntrar`): depois de rolar até o fim, todos os elementos com
  `data-revelar` ficam com opacidade 1. Com movimento reduzido nenhuma media query do GSAP casa, e o
  conteúdo fica visível sem animação.
- Desktop, 1920×1080 no Chrome:
  - Sobre: título, abertura, texto e fatos em grade de 12 colunas;
  - Selected Work: quatro imagens carregadas (1440 px, `width`/`height` declarados), número
    grande, linha de 1px entre projetos, links em pílula, outros projetos em duas colunas;
  - Experiência: período em mono, cargo, atividades. Conteúdo conferido contra `CONTENT.md`;
  - Tech Stack: cinco grupos em texto grande, sem barra de nível;
  - Contato: "LET'S TALK.", e-mail, copiar, LinkedIn, GitHub e rodapé.
- Copiar e-mail: com a área de transferência liberada, a mensagem `aria-live` mostra
  "E-mail copiado.". Com `writeText` forçado a falhar, mostra o endereço para copiar à mão.
- Voltar ao topo: chega a `scrollY` 0, com o foco no `#inicio`.
- Celular, em iframe de 320 e 375 px: sem rolagem horizontal; todas as seções revelam.
- Correção: no Hero em 320, 375 e 390 px, a linha "DEVELOPER." passava da margem direita
  (16vw ≈ 5,8 × o tamanho da fonte). O tamanho mudou para 15vw. Medido depois: margem 25/16 px em
  320 e 27/24 px em 375.
- Console sem erros após recarga.
- NOT RUN: foco visível com teclado real (fica para a TASK 12).
