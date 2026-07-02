# Documentação Técnica de Arquitetura do Projeto Unite

**Projeto:** Unite  
**Categoria:** Sistema web para gestão de ordens de serviço  
**Finalidade:** Documento técnico para entrega acadêmica  
**Data:** Julho de 2026

---

## 1. Resumo Executivo

O Unite é uma aplicação web para gestão operacional de ordens de serviço, clientes, técnicos, atendentes, materiais e estoque. O sistema centraliza o fluxo de atendimento técnico desde a abertura da ordem de serviço até sua conclusão, permitindo registrar agendamentos, responsáveis, materiais utilizados, anexos, histórico de eventos, cancelamentos, reagendamentos e medições de velocidade.

A solução foi desenvolvida com TypeScript, React, TanStack Start, TanStack Router, Drizzle ORM e PostgreSQL. A arquitetura combina frontend e backend no mesmo projeto, usando Server Functions para encapsular regras de negócio no servidor e Drizzle ORM para acesso tipado ao banco de dados. A aplicação também integra Supabase Storage para anexos e Nodemailer para envio de e-mails de recuperação de senha.

O projeto possui organização por funcionalidades, validação de dados com Zod, interface componentizada, rotas protegidas, autenticação por cookie assinado e regras transacionais em operações críticas, como conclusão de ordem de serviço e baixa de estoque.

---

## 2. Objetivo do Sistema

O objetivo do Unite é informatizar o processo de atendimento técnico, reduzindo controles manuais e melhorando rastreabilidade, padronização e segurança das informações.

Objetivos específicos:

- Gerenciar clientes e dados cadastrais.
- Controlar técnicos internos e terceirizados.
- Cadastrar atendentes, supervisores e administradores.
- Registrar, agendar, iniciar, concluir, cancelar e reagendar ordens de serviço.
- Controlar materiais, estoque mínimo e movimentações.
- Associar materiais utilizados a ordens de serviço.
- Registrar histórico de alterações para auditoria.
- Permitir anexos vinculados a ordens de serviço.
- Registrar resultados de speed test durante atendimentos.
- Aplicar regras de agenda, como bloqueio de feriados, finais de semana e horários fora do expediente.

---

## 3. Visão Geral da Arquitetura

O Unite segue uma arquitetura web em camadas, organizada por funcionalidades de negócio. A aplicação utiliza TanStack Start para integrar rotas, interface React e Server Functions em um único projeto.

### 3.1 Camadas principais

| Camada | Responsabilidade | Tecnologias |
| --- | --- | --- |
| Interface de usuário | Telas, formulários, tabelas, feedbacks e navegação | React, Tailwind CSS, Radix UI, Lucide React |
| Roteamento | Definição de páginas, layouts e rotas protegidas | TanStack Router |
| Estado do cliente | Sessão visual, estado global e cache assíncrono | Zustand, TanStack Query |
| Validação | Regras de entrada em formulários e chamadas ao servidor | Zod |
| Backend da aplicação | Regras de negócio e operações protegidas | TanStack Server Functions |
| Persistência | Modelagem, consultas, relações e transações | Drizzle ORM, PostgreSQL |
| Integrações externas | Anexos e e-mails | Supabase Storage, Nodemailer |
| Qualidade | Padronização, formatação e testes | ESLint, Prettier, Vitest |

### 3.2 Diagrama lógico simplificado

`	ext
Usuário
  |
  v
Interface React
  |
  v
TanStack Router + Layout autenticado
  |
  v
Componentes de feature + formulários
  |
  v
Validação com Zod
  |
  v
Server Functions do TanStack Start
  |
  +--> Drizzle ORM --> PostgreSQL
  |
  +--> Supabase Storage
  |
  +--> Nodemailer / SMTP
`

### 3.3 Organização arquitetural

O projeto adota uma estrutura feature-based. Cada domínio funcional concentra seus componentes, telas, validações e funções de servidor. Essa abordagem torna o código mais fácil de manter, pois os arquivos relacionados a uma mesma regra de negócio ficam próximos entre si.

Benefícios dessa organização:

- Melhor localização dos arquivos por contexto de negócio.
- Menor acoplamento entre módulos.
- Evolução independente das funcionalidades.
- Reutilização de componentes globais sem misturar regras específicas.
- Facilidade para novos desenvolvedores compreenderem o projeto.


---

## 4. Tecnologias Utilizadas

### 4.1 Linguagem, runtime e ferramentas

| Tecnologia | Aplicação no projeto |
| --- | --- |
| TypeScript | Linguagem principal, fornecendo tipagem estática e maior segurança no desenvolvimento. |
| Node.js | Ambiente de execução para ferramentas, servidor, build e scripts. |
| PNPM | Gerenciador de pacotes recomendado para instalação e execução dos comandos. |
| Vite | Ferramenta de desenvolvimento e build. |
| Nitro | Infraestrutura de servidor utilizada junto ao TanStack Start. |

### 4.2 Frontend

| Tecnologia | Aplicação no projeto |
| --- | --- |
| React 19 | Construção da interface por componentes. |
| React DOM | Renderização da aplicação no navegador. |
| TanStack Router | Rotas baseadas em arquivos, layouts, preload e integração com query. |
| TanStack Query | Gerenciamento de cache e dados assíncronos. |
| Zustand | Estado global leve, especialmente para autenticação. |
| Tailwind CSS 4 | Estilização utilitária e responsiva. |
| Radix UI | Componentes acessíveis de base. |
| Lucide React | Ícones da interface. |
| Sonner | Notificações e feedback ao usuário. |
| Recharts | Gráficos e visualizações. |
| React Hook Form | Controle de formulários. |
| Zod | Validação e inferência de tipos. |

### 4.3 Backend, banco e integrações

| Tecnologia | Aplicação no projeto |
| --- | --- |
| TanStack Start | Estrutura full-stack da aplicação. |
| Server Functions | Funções de servidor chamadas pela interface. |
| PostgreSQL | Banco de dados relacional principal. |
| Drizzle ORM | Schema, queries tipadas, relações e transações. |
| Drizzle Kit | Migrações e sincronização do schema. |
| pg | Driver de conexão com PostgreSQL. |
| bcryptjs | Hash e verificação de senhas. |
| Supabase Storage | Armazenamento de anexos de ordens de serviço. |
| Nodemailer | Envio de e-mails, incluindo recuperação de senha. |

### 4.4 Qualidade

| Tecnologia | Aplicação no projeto |
| --- | --- |
| ESLint | Análise estática e padronização. |
| Prettier | Formatação automática. |
| Vitest | Testes automatizados. |
| Testing Library | Apoio para testes de componentes React. |
| JSDOM | Ambiente DOM para testes. |

---

## 5. Estrutura de Pastas

`	ext
src/
  components/              Componentes globais e componentes de UI
  components/layout/       Layout autenticado, sidebar, topbar e navegação
  db/                      Configuração do banco e schema Drizzle
  features/                Funcionalidades de negócio
  integrations/            Integrações com bibliotecas externas
  lib/                     Utilitários e serviços compartilhados
  routes/                  Rotas baseadas em arquivos
  stores/                  Estado global do cliente
  router.tsx               Configuração do TanStack Router

drizzle/                   Migrações e snapshots do banco
public/                    Arquivos públicos, imagens, ícones e manifesto
scratch/                   Scripts auxiliares de desenvolvimento
`

Principais funcionalidades em src/features:

| Feature | Responsabilidade |
| --- | --- |
| uth | Login, logout, alteração de senha e recuperação de senha. |
| clientes | Cadastro, listagem, edição e visualização de clientes. |
| 	ecnicos | Gestão de técnicos internos e terceirizados. |
| tendentes | Gestão de usuários operacionais e administrativos. |
| materiais | Cadastro de materiais, estoque e associação com técnicos. |
| ordens-servico | Fluxo principal de OS, conclusão, cancelamento, reagendamento, anexos e speed test. |
| configuracoes | Regras globais do sistema, como agenda e expediente. |

Padrão recorrente dentro de uma feature:

`	ext
feature/
  index.tsx        Tela principal ou listagem
  novo/            Tela de criação
  editar/          Tela de edição
  ver/             Tela de visualização
  components/      Componentes específicos da funcionalidade
  schema.ts        Validações Zod e tipos
  server.ts        Server Functions e regras de negócio
`

---

## 6. Roteamento e Navegação

O roteamento é implementado com TanStack Router. As rotas ficam em src/routes e a árvore final é gerada em src/routeTree.gen.ts.

Rotas públicas principais:

- /
- /login

Rotas autenticadas ficam sob o layout _app, que verifica o estado de autenticação persistido antes de permitir o acesso. Exemplos:

- /dashboard
- /clientes
- /clientes/novo
- /clientes/
- /clientes//editar
- /tecnicos
- /materiais
- /ordens-servico
- /ordens-servico/nova
- /ordens-servico//gerenciar
- /agenda
- /configuracoes

O layout autenticado inclui estrutura visual compartilhada, como sidebar, topbar, navegação inferior e área principal de conteúdo.


---

## 7. Estado, Sessão e Comunicação com o Servidor

### 7.1 Estado no cliente

A autenticação visual é mantida por Zustand em src/stores/auth.store.ts. A store armazena o usuário atual, o indicador de autenticação e funções para iniciar ou limpar a sessão. O estado é persistido no localStorage com a chave unite-auth.

### 7.2 Sessão no servidor

No servidor, a sessão é representada por um cookie HTTP-only chamado unite_session. O cookie contém um payload com ID do usuário e tipo de usuário, assinado com HMAC-SHA256. Essa assinatura permite detectar adulterações no valor do cookie.

Tipos de usuário suportados:

- user: usuários administrativos, atendentes ou supervisores.
- 	ecnico: usuários técnicos.

### 7.3 Comunicação com dados assíncronos

TanStack Query é utilizado como base para cache e comunicação assíncrona. O projeto cria um QueryClient e o integra ao TanStack Router, permitindo melhor controle de dados carregados por rotas e componentes.

---

## 8. Backend e Regras de Negócio

O backend é implementado com Server Functions, localizadas principalmente nos arquivos server.ts das features. Essas funções executam validações, permissões, operações de banco, transações e integrações externas.

Responsabilidades típicas das Server Functions:

- Validar entrada com Zod.
- Consultar e alterar dados no PostgreSQL.
- Verificar permissões.
- Executar transações.
- Registrar histórico.
- Enviar e-mails.
- Fazer upload ou remoção de anexos.

### 8.1 Fluxo de criação de ordem de serviço

`	ext
Usuário preenche formulário
  |
  v
Schema Zod valida dados
  |
  v
createOrdemServico executa no servidor
  |
  +--> valida regras de agendamento
  +--> define status inicial
  +--> gera número da OS
  +--> grava em ordens_servico
  +--> registra criação em os_historico
  |
  v
Interface atualiza a experiência do usuário
`

### 8.2 Fluxo de conclusão de ordem de serviço

A conclusão de uma OS usa transação para preservar consistência entre OS, materiais, estoque e histórico.

Etapas principais:

1. Validar autenticação.
2. Buscar a OS atual.
3. Verificar permissão do técnico, quando aplicável.
4. Bloquear conclusão inválida em OS cancelada ou já concluída.
5. Validar materiais informados.
6. Verificar saldo em estoque.
7. Registrar materiais utilizados.
8. Baixar quantidade do estoque.
9. Registrar movimentação de estoque.
10. Atualizar OS para concluida.
11. Registrar histórico de conclusão.
12. Retornar alerta de estoque mínimo, quando necessário.

---

## 9. Modelo de Dados

O schema principal está em src/db/schema.ts e é modelado com Drizzle ORM para PostgreSQL.

### 9.1 Entidades principais

| Entidade | Finalidade |
| --- | --- |
| users | Usuários administrativos, atendentes e supervisores. |
| clientes | Cadastro de clientes. |
| 	ecnicos | Cadastro de técnicos internos ou terceiros. |
| materiais | Itens de estoque. |
| estoque_movimentacoes | Entradas, saídas por OS e ajustes de estoque. |
| ordens_servico | Entidade central do sistema. |
| os_materiais | Materiais utilizados em uma OS. |
| os_historico | Auditoria e histórico de eventos da OS. |
| os_arquivos | Anexos vinculados a uma OS. |
| password_reset_codes | Códigos temporários de recuperação de senha. |
| settings | Configurações globais do sistema. |

### 9.2 Relacionamentos principais

`	ext
clientes 1:N ordens_servico
tecnicos 1:N ordens_servico
users 1:N ordens_servico
ordens_servico 1:N os_materiais
ordens_servico 1:N os_historico
ordens_servico 1:N os_arquivos
materiais 1:N os_materiais
materiais 1:N estoque_movimentacoes
ordens_servico 1:N estoque_movimentacoes
`

### 9.3 Enums de domínio

| Enum | Valores principais |
| --- | --- |
| user_role | dmin, tendente, supervisor |
| 	ecnico_tipo | interno, 	erceiro |
| 	ecnico_perfil | 	ecnico, supervisor |
| cliente_status | tivo, inativo |
| material_status | tivo, inativo |
| os_status | berta, gendada, em_execucao, concluida, cancelada, eagendada, pendente |
| os_prioridade | aixa, 
ormal, lta |
| os_tipo_servico | instalacao, manutencao, 	roca_equipamento, infra, outro |
| os_acao_historico | criacao, gendamento, mudanca_tecnico, eagendamento, cancelamento, conclusao, tualizacao |

### 9.4 Ordem de serviço como entidade central

A tabela ordens_servico guarda número, data de abertura, cliente, técnico, tipo de serviço, prioridade, status, valor, datas de execução, observações, dados de speed test, dados de cancelamento e dados de reagendamento. Ela se relaciona com clientes, técnicos, usuários, materiais utilizados, histórico e anexos.


---

## 10. Autenticação, Autorização e Segurança

### 10.1 Login

O login aceita e-mail ou nome de usuário. A autenticação consulta duas origens:

- users, para administradores, atendentes e supervisores.
- 	ecnicos, para técnicos.

As senhas são armazenadas como hash usando cryptjs, evitando persistência de senha em texto puro.

### 10.2 Autorização

O projeto possui funções auxiliares como equireTecnicoOrAdmin e equireAdmin. Elas validam a sessão antes de permitir operações protegidas.

Regras identificadas:

- Técnico só acessa ordens de serviço atribuídas a ele.
- Técnico só pode usar materiais associados ao seu próprio estoque.
- OS concluída ou cancelada possui restrições de alteração.
- OS concluída não pode ser cancelada.

### 10.3 Recuperação de senha

O fluxo de recuperação usa códigos temporários:

1. O usuário informa o e-mail.
2. O sistema procura o e-mail em users e 	ecnicos.
3. Um código de seis dígitos é gerado.
4. O código é salvo com expiração de 15 minutos.
5. O código é enviado por e-mail.
6. O usuário informa código e nova senha.
7. O sistema valida código, expiração e uso anterior.
8. A senha é atualizada com novo hash.
9. O código é marcado como utilizado.

### 10.4 Boas práticas observadas

- Hash de senha com bcrypt.
- Cookie HTTP-only para sessão.
- Assinatura criptográfica do cookie.
- Validação de payloads com Zod.
- Enums no banco para restringir valores.
- Transações em operações críticas.

### 10.5 Melhorias recomendadas em segurança

- Exigir SESSION_SECRET forte em produção, sem fallback fixo.
- Reduzir logs sensíveis de integrações externas.
- Implementar rate limit em login e recuperação de senha.
- Revisar permissões por papel com RBAC completo.
- Avaliar política de privacidade dos anexos no Supabase Storage.

---

## 11. Regras de Negócio

### 11.1 Ciclo de vida da OS

`	ext
aberta -> agendada -> em_execucao -> concluida

Estados alternativos:
cancelada, reagendada, pendente
`

Principais regras:

- Uma OS pode iniciar aberta ou agendada.
- Agendamentos podem ser bloqueados conforme configurações globais.
- Conclusão pode registrar materiais e speed test.
- Alterações importantes são gravadas no histórico.
- Reagendamento exige motivo e nova data.
- Cancelamento exige motivo.

### 11.2 Agenda e expediente

O sistema valida:

- Feriados nacionais brasileiros.
- Sábados e domingos.
- Horário de entrada e saída.
- Intervalo de almoço.
- Agendamento retroativo.

As regras são lidas da tabela settings, permitindo configuração sem alteração direta no código.

### 11.3 Estoque

Na conclusão de uma OS, o sistema:

- Verifica se o material existe.
- Valida quantidade positiva.
- Confere saldo disponível.
- Exige quantidade inteira para unidades que não sejam metro.
- Registra material utilizado na OS.
- Atualiza quantidade em estoque.
- Registra movimentação do tipo SAIDA_OS.
- Indica materiais abaixo do estoque mínimo.

### 11.4 Anexos

A aplicação permite anexar arquivos a ordens de serviço usando Supabase Storage. O banco armazena metadados como nome, tipo, caminho no storage, URL pública e data de criação. O fluxo atual limita uma OS a cinco arquivos.

---

## 12. Padrões de Desenvolvimento

### 12.1 Organização

O padrão principal é feature-based. A estrutura aproxima o código da linguagem de negócio, deixando cada funcionalidade responsável por suas telas, validações e operações de servidor.

### 12.2 Validação

Os schemas Zod são usados para validar entradas e inferir tipos TypeScript. Isso reduz duplicação entre formulário, servidor e regras de domínio.

### 12.3 Acesso a dados

O Drizzle ORM é o padrão de persistência. Ele fornece schema tipado, relações, consultas e transações. Migrações e snapshots ficam na pasta drizzle.

### 12.4 Interface

Componentes globais ficam em src/components, incluindo botões, cards, tabelas, modais, inputs, badges, calendários e tooltips. A interface usa Tailwind CSS e componentes acessíveis baseados em Radix UI.

### 12.5 Nomenclatura recomendada

- Componentes React: PascalCase.
- Funções e variáveis: camelCase.
- Pastas e arquivos: kebab-case.
- Tabelas e colunas: snake_case.
- Enums: nomes descritivos do domínio.

### 12.6 Comandos de qualidade

`	ext
pnpm lint       Executa análise estática
pnpm format     Formata e corrige código
pnpm check      Verifica formatação
pnpm test       Executa testes automatizados
pnpm build      Sincroniza banco e gera build
`


---

## 13. Deploy e Configuração

### 13.1 Ambiente local

Pré-requisitos:

- Node.js 20 ou superior.
- PNPM.
- PostgreSQL.
- Variáveis de ambiente configuradas.

Fluxo básico:

`	ext
pnpm install
pnpm db:setup
pnpm dev
`

Por padrão, o servidor de desenvolvimento roda em:

`	ext
http://localhost:3000
`

### 13.2 Variáveis de ambiente

| Variável | Finalidade |
| --- | --- |
| DATABASE_URL | Conexão com PostgreSQL. |
| SESSION_SECRET | Segredo de assinatura da sessão. |
| SUPABASE_URL | URL do projeto Supabase. |
| SUPABASE_SERVICE_ROLE_KEY | Chave de serviço para storage. |
| SUPABASE_BUCKET | Bucket de anexos. |
| Variáveis SMTP | Envio de e-mails via Nodemailer. |

Valores reais não devem ser versionados nem incluídos em documentação pública.

### 13.3 Build

O script de build executa:

`	ext
drizzle-kit push && vite build
`

Isso indica que o schema do banco é sincronizado antes da geração final da aplicação.

---

## 14. Testes e Qualidade

O projeto possui configuração para Vitest e inclui testes voltados a regras utilitárias, como feriados e expediente. Para aumentar a confiabilidade, recomenda-se ampliar testes nas seguintes áreas:

- Autenticação e recuperação de senha.
- Permissões entre técnico e administrador.
- Criação, reagendamento, cancelamento e conclusão de OS.
- Baixa de estoque em transação.
- Validação de agendamento.
- Upload e remoção de anexos.
- Bloqueios por status da OS.

Esses testes são importantes porque OS e estoque são fluxos sensíveis para a consistência operacional do sistema.

---

## 15. Pontos Fortes

- Uso consistente de TypeScript.
- Organização por funcionalidades de negócio.
- Banco relacional com relações, chaves estrangeiras e enums.
- Drizzle ORM para acesso tipado aos dados.
- Zod para validação de payloads.
- Transações em operações críticas.
- Histórico de eventos para auditoria.
- Interface componentizada.
- Integração com Supabase Storage para anexos.
- Recuperação de senha por código temporário.
- Configurações globais para regras de agenda.

---

## 16. Limitações e Melhorias Futuras

Recomendações para evolução:

- Implementar RBAC completo por papel: admin, atendente, supervisor e técnico.
- Criar camada explícita de serviços para regras reutilizadas entre Server Functions.
- Adicionar paginação e filtros server-side em listagens grandes.
- Registrar usuário responsável em todos os eventos de auditoria.
- Criar testes de integração para OS e estoque.
- Melhorar observabilidade com logs estruturados.
- Adicionar rate limit no login e na recuperação de senha.
- Criar rotina de limpeza de códigos expirados.
- Avaliar anexos privados com autorização de acesso.
- Padronizar tratamento de erros para respostas mais consistentes.

---

## 17. Conclusão

O Unite apresenta uma arquitetura coerente para um sistema acadêmico com características próximas a um produto real. A combinação de React, TypeScript, TanStack Start, Drizzle ORM e PostgreSQL oferece uma base moderna, tipada e organizada. A estrutura por funcionalidades facilita manutenção, enquanto as Server Functions concentram regras de negócio no domínio correspondente.

O sistema cobre processos relevantes de uma operação de atendimento técnico, incluindo cadastro, autenticação, agendamento, execução de serviços, baixa de materiais, anexos, histórico e configurações de agenda. A modelagem relacional e o uso de transações contribuem para a integridade dos dados, especialmente no fluxo de conclusão de ordens de serviço.

De modo geral, o projeto demonstra aplicação prática de conceitos importantes de engenharia de software, como separação de responsabilidades, validação de dados, persistência relacional, autenticação, componentização, organização modular e preocupação com qualidade de código.

---

## 18. Referências Técnicas Internas

| Arquivo | Conteúdo analisado |
| --- | --- |
| package.json | Dependências, scripts e stack técnica. |
| README.md | Descrição geral e instruções do projeto. |
| src/db/schema.ts | Modelo de dados, enums, tabelas e relações. |
| src/db/index.ts | Conexão PostgreSQL com Drizzle ORM. |
| src/router.tsx | Configuração do TanStack Router. |
| src/routes/_app.tsx | Proteção de rotas autenticadas. |
| src/stores/auth.store.ts | Estado global de autenticação. |
| src/lib/auth-server.ts | Sessão, cookie assinado e autorização. |
| src/features/auth/server.ts | Login, logout, senha e recuperação. |
| src/features/ordens-servico/server.ts | Regras principais de ordens de serviço. |
| src/features/ordens-servico/schema.ts | Validações de OS com Zod. |
| src/lib/supabase-storage.ts | Integração com Supabase Storage. |
| src/lib/holidays.ts | Regras de feriados, finais de semana e expediente. |
| drizzle.config.ts | Configuração de migrações e banco. |
| vite.config.ts | Configuração de build, plugins e TanStack Start. |

