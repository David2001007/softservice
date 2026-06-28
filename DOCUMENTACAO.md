# Documentação Técnica - Sistema Unite

## 1. Visão Geral

**Nome do sistema:** Unite (internamente também referido como PulseNet em algumas configurações)
**Objetivo do sistema:** Plataforma moderna para gestão de ordens de serviço (OS), atendentes, técnicos e controle de materiais em estoque.
**Problema que resolve:** Centraliza e digitaliza o fluxo de atendimento em campo e interno, substituindo controles manuais por um fluxo validado de abertura, agendamento, gerenciamento de arquivos e conclusão de ordens de serviço com baixa automática de estoque.
**Público-alvo:** Provedores de internet, empresas de telecomunicações, assistência técnica e prestadores de serviços em campo.
**Principais funcionalidades:** 
- Autenticação e Gestão de Usuários (Administradores, Atendentes, Técnicos)
- Cadastro e Gestão de Clientes e Materiais
- Ciclo de Vida completo de Ordens de Serviço (Abertura, Agendamento, Execução, Conclusão, Cancelamento)
- Controle de estoque integrado (baixa na conclusão da OS)
- Upload e Gestão de Arquivos nas OS
- Relatórios/Dashboard
- Speed Test Integrado na OS

**Tecnologias utilizadas:**
- **Frontend/Backend Unificado:** React 19, Vite, TanStack Start/Router (SSR e RPC)
- **Estilização:** Tailwind CSS 4, Radix UI, classes utilitárias
- **Banco de Dados:** PostgreSQL
- **ORM / Acesso a Dados:** Drizzle ORM
- **Validações:** Zod, React Hook Form
- **Gerenciamento de Estado:** Zustand
- **Serviços Externos:** Supabase (para Storage de arquivos), SMTP (Nodemailer)

---

## 2. Arquitetura do Projeto

**Estrutura de Pastas:**
O projeto segue uma arquitetura modularizada focada em *features*.
- `src/components/`: Componentes UI genéricos e reutilizáveis (botões, modais, tabelas).
- `src/db/`: Configuração do banco de dados e definição do schema Drizzle.
- `src/features/`: Módulos de negócio. Contém a lógica de interface, validações (`schema.ts`) e comunicação RPC (`server.ts`) separada por domínio (auth, os, clientes, etc).
- `src/lib/`: Utilitários gerais (serviço de e-mail, storage do Supabase, formatações).
- `src/routes/`: Definição de rotas baseadas em arquivos pelo TanStack Router.

**Fluxo entre Frontend e Backend:**
Não existe uma API REST tradicional (arquivos separados de rotas/controllers para cada endpoint). O fluxo utiliza **RPC (Remote Procedure Call)** através da função `createServerFn` do TanStack. O frontend chama funções typescript diretamente que são executadas no servidor de forma segura, garantindo tipagem de ponta a ponta.

**Fluxo de Autenticação:**
Usuários e técnicos fazem login no mesmo endpoint. O sistema valida contra tabelas distintas, gerando uma sessão segura (gerenciada por auth cookies/tokens). Senhas são criptografadas (bcrypt).

**Fluxo de Comunicação com BD:**
As requisições RPC utilizam o `drizzle-orm` para consultas tipadas ao PostgreSQL de maneira assíncrona.

**Serviços Externos Utilizados:**
- **Supabase Storage:** Armazenamento seguro e em nuvem de fotos/documentos de Ordens de Serviço.
- **Nodemailer/SMTP:** Disparo de códigos de recuperação de senha por e-mail.

---

## 3. Funcionalidades do Sistema

### 3.1 Gestão de Ordens de Serviço (OS)
- **Nome:** Ciclo de Vida da OS
- **Objetivo:** Acompanhar um atendimento do início ao fim.
- **Como funciona:** O usuário cria uma OS com prioridade, tipo, cliente e técnico (opcional). Pode transitar entre Aberta, Agendada, Em Execução, Concluída ou Cancelada.
- **Regras de Negócio:**
  - OS criadas com data definida recebem status 'agendada'. Sem data, 'aberta'.
  - Não é possível editar, reagendar ou cancelar uma OS que já esteja "Concluída" ou "Cancelada".
  - O início de um atendimento muda o status para "Em Execução".
- **Arquivos responsáveis:** `src/features/ordens-servico/server.ts`, `schema.ts`.

### 3.2 Conclusão de OS e Baixa de Estoque
- **Nome:** Conclusão de OS
- **Objetivo:** Finalizar o atendimento registrando o consumo real e testes de rede.
- **Como funciona:** O técnico preenche dados finais, resultados do "Speed Test" e os materiais utilizados.
- **Regras de Negócio:**
  - A quantidade consumida é subtraída automaticamente do estoque global do sistema no ato da conclusão.
  - A operação de encerramento, histórico e baixa de material são transacionadas (Tudo ou Nada) para evitar inconsistência de banco.
  - Apenas materiais com status "ativo" deveriam ser passíveis de uso.

### 3.3 Gestão de Arquivos (OS)
- **Nome:** Upload de Anexos
- **Objetivo:** Armazenar evidências (fotos/pdf) da OS.
- **Regras de Negócio:** 
  - Limite rigoroso de **5 arquivos por Ordem de Serviço**. Acima disso a RPC rejeita a requisição.
  - O arquivo é enviado em base64, convertido em buffer e armazenado no Supabase. O banco guarda a URL pública.

### 3.4 Gestão de Materiais
- **Nome:** Estoque de Materiais
- **Objetivo:** Cadastrar produtos e visualizar saldo.
- **Regras de Negócio:** Produtos possuem indicativo se podem ser utilizados em "comodato" ou "venda". Tem controle de estoque mínimo.

### 3.5 Recuperação de Senha
- **Nome:** Forgot Password
- **Como funciona:** O usuário informa o e-mail. O sistema envia um código de 6 dígitos via SMTP.
- **Regras de Negócio:** O código expira estritamente em **15 minutos**. 

---

## 4. Documentação de Telas

O sistema possui uma estrutura central no `_app.tsx` que abriga layout com menu lateral (Dashboard, OS, Agenda, etc). 

*Lista de Telas Principais (Rotas Base)*
- **Login (`/login`):** Tela inicial. Componentes: Form de acesso, link de recuperar senha.
- **Dashboard (`/dashboard`):** Visão inicial da operação (Indicadores/Gráficos).
- **Ordens de Serviço (`/ordens-servico`):**
  - **Listagem (`index`):** Tabela principal com listagem de todas as OS.
    - Filtros: Possível busca e filtros laterais (`accordion-filters.tsx`).
    - Ações: Ver, Editar, Gerenciar.
  - **Nova (`nova`):** Criação. Campos: Cliente, Tipo de Serviço, Descrição, Técnico, Agendamento. Botões: Salvar, Cancelar.
  - **Visualização (`$id/index`):** View read-only dos dados gerais e histórico da OS.
  - **Gerenciar (`$id/gerenciar`):** Painel focado na operação (Upload, Iniciar Atendimento, Reagendar, Concluir).
- **Agenda (`/agenda`):** Componente de calendário (`react-day-picker` provável), filtrando OS baseada na `dataAgendada`.
- **Demais (Atendentes, Clientes, Técnicos, Materiais):** Seguem padrão CRUD (`index` para listagem, `novo` para criação e `$id/editar` para modificação).

---

## 5. Fluxos do Sistema

### 5.1 Fluxo de Encerramento de OS
- **Entrada:** Usuário acessa aba "Gerenciar" da OS, clica em "Concluir". Preenche data/hora de execução, resultados do speed test e adiciona itens consumidos.
- **Processamento:** 
  1. RPC `concluirOrdemServico` recebe os dados.
  2. Valida se OS não está cancelada/concluída.
  3. Atualiza tabela `ordens_servico`.
  4. Insere materiais em `os_materiais`.
  5. Deduz valores na tabela `materiais`.
  6. Registra ação em `os_historico`.
- **Validações:** Quantidade do material deve ser válida e finita. Se erro de banco, rollback é feito automaticamente.
- **Saída:** Sistema reflete OS como concluída; Saldo no estoque é atualizado.

---

## 6. Banco de Dados

O ORM utilizado é Drizzle. Tabelas principais:

1. **users:** 
   - *Finalidade:* Administradores e Atendentes. 
   - *Campos Notáveis:* codigo, cpf, email, username, password_hash, role (admin, atendente, supervisor).
2. **tecnicos:** 
   - *Finalidade:* Funcionários de campo (internos ou terceiros). 
   - *Campos Notáveis:* tipo, empresa, cnpj, perfil, username. 
3. **clientes:** 
   - *Finalidade:* Contratantes de serviço.
4. **materiais:** 
   - *Finalidade:* Produtos estocáveis.
   - *Campos Notáveis:* quantidade (numeric), estoque_minimo, comodato.
5. **ordens_servico:** 
   - *Finalidade:* Cabeçalho do atendimento.
   - *Relacionamentos:* Cliente, Tecnico, User (criador).
   - *Campos Notáveis:* status (enum), tipo_servico, data_agendada, speed_test_ping/download/upload.
6. **os_materiais:**
   - *Finalidade:* Itens consumidos por uma OS (N:N).
7. **os_historico:**
   - *Finalidade:* Trilha de auditoria (quem alterou, o que, quando).
8. **os_arquivos:**
   - *Finalidade:* Lista de URLs de anexo.
9. **password_reset_codes:**
   - *Finalidade:* Códigos transientes de redefinição.

*Uso:* O banco é operado estritamente por RPCs server-side, garantindo segurança na injeção e transações.

---

## 7. Rotas

O sistema usa o *file-based routing* do TanStack.
- `/login`: Auth page. Permissão pública.
- `/_app`: Layout protegido (apenas usuários logados).
  - `/dashboard`: Resumo.
  - `/agenda`: Agendamentos.
  - `/ordens-servico/`: Listagem OS.
  - `/ordens-servico/nova`: Cria OS.
  - `/ordens-servico/$id/`: Visualiza OS.
  - `/ordens-servico/$id/editar`: Edita OS.
  - `/ordens-servico/$id/gerenciar`: Workspace da OS.
  - Mesma padronização se aplica para: `/clientes`, `/tecnicos`, `/materiais`, `/atendentes`.

---

## 8. Componentes Reutilizáveis

Encontrados em `src/components/ui/` e `src/components/`:
- **default-table.tsx:** Renderização universal de data-tables com paginação e ordenação (provavelmente `@tanstack/react-table`).
- **default-modal.tsx:** Container flutuante (Dialog do Radix) usado em encerramentos, exclusões e uploads.
- **status-badge.tsx:** Componente puramente visual que traduz enums (ex: "em_execucao") para um badge colorido e legível para usuários.
- **accordion-filters.tsx:** Painel lateral expansível para inputs de busca e filtragem de listagens.
- **delete-confirmation-modal.tsx:** Modal padrão para ações destrutivas, exigindo duplo clique ou confirmação para prosseguir.

---

## 9. APIs (Internal RPCs)

Implementado via `createServerFn`. Não há REST / GraphQL. 
*Exemplo: Ordens de Serviço (`src/features/ordens-servico/server.ts`)*
- `getOrdensServico`: (GET) Retorna lista.
- `createOrdemServico`: (POST) Recebe form, retorna OS criada.
- `concluirOrdemServico`: (POST) Recebe `{id, data}`. Executa baixa de estoque e muda status.
- `uploadOsArquivo`: (POST) Recebe JSON com Base64 do arquivo, envia pro Supabase, retorna lista atualizada.
- `speedTestPing`/`Download`/`Upload`: (GET/POST) Endpoints artificiais que simulam e registram teste de carga. 
- *Tratamento de Erros:* Lançam `throw new Error(...)` na RPC. O frontend capta a exception (via react-query/TanStack mutations) e exibe toasts de erro.

---

## 10. Regras de Negócio

1. **Mutabilidade de OS Fechadas:** OS com status 'cancelada' ou 'concluida' estão congeladas. Não podem ser alteradas.
2. **Auditoria Transparente:** Qualquer mudança de status (Criação, Reagendamento, Início, Fim, Cancelamento) injeta automaticamente um registro na tabela `os_historico`.
3. **Limite de Anexos por OS:** Hard limit de 5 arquivos por OS imposto pelo lado do servidor.
4. **Agendamento Dinâmico:** Ao criar/atualizar OS informando data, o sistema sobrescreve status pra "agendada" invés de "aberta".
5. **Autenticação Unificada (Polimorfismo Básico):** Admin e Técnico fazem login no mesmo form, mas existem em tabelas separadas. O backend pesquisa na tabela 1 e, se falhar, tenta na tabela 2, retornando um tipo `userType` distinguível pro client.

---

## 11. Segurança

- **Login e Senhas:** bcrypt.compare() no back-end.
- **Autorização:** A propriedade `role` no banco define nível hierárquico (admin, atendente, supervisor).
- **Proteção de Rotas:** Feita pelo `_app.tsx` / guards do router, ejetando tokens inválidos.
- **Validação de Dados:** Todo e qualquer input proveniente do cliente é blindado pelos *Schemas do Zod* (ex: `osConclusaoSchema`). O Drizzle também implementa tipos estritos, prevenindo SQL Injection por padrão.

---

## 12. Estrutura do Projeto (Árvore)

```text
softservice/
├── .nitro/            # Configurações do ambiente nitro
├── drizzle/           # Migrations geradas do BD
├── src/
│   ├── components/    # Reusabilidade UI e layout
│   ├── db/            # Conexão (index.ts) e tabelas (schema.ts)
│   ├── features/      # Coração do negócio (auth, os, clientes)
│   ├── lib/           # Helpers puros (supabase, mail)
│   └── routes/        # Router files (paginação visível)
├── package.json       # Dependências e Scripts
├── drizzle.config.ts  # Config para gerar/push do DB
└── vite.config.ts     # Configuração do Vite/TanStack
```

---

## 13. Guia de Instalação

**Pré-requisitos:** Node 20+, PostgreSQL rodando, Supabase (Bucket público), SMTP.

1. **Clonar e instalar dependências**
   ```bash
   git clone <repo>
   cd softservice
   pnpm install
   ```
2. **Variáveis de Ambiente** (`.env.local`)
   ```env
   DATABASE_URL="postgres://user:pass@localhost:5432/unite"
   # Recomenda-se adicionar credenciais SMTP e Supabase, se existirem na infra
   ```
3. **Banco de Dados**
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```
4. **Executar**
   ```bash
   pnpm dev
   ```
5. **Build de Produção**
   ```bash
   pnpm build
   # Utilize o comando start apropriado para Vite/Nitro
   ```

---

## 14. Guia do Desenvolvedor

- **Adicionar uma Nova Tabela:** Vá em `src/db/schema.ts`, crie a const `pgTable`. Após finalizar, rode `pnpm db:generate && pnpm db:migrate`.
- **Adicionar Nova Rota:** Crie um arquivo no padrão TanStack (`_app.nova-aba.index.tsx` em `src/routes/`). O TanStack auto-gerará `routeTree.gen.ts`.
- **Criar Função RPC:** Dentro de `src/features/<modulo>/server.ts`, exporte um `createServerFn().inputValidator(zodSchema).handler(...)`. Chame-o diretamente do arquivo frontend no clique do botão.

---

## 15. Manual do Usuário

**Bem-vindo ao Unite!**
- **Acessar o Sistema:** Digite seu e-mail e senha na tela de login. 
- **Ver OS do Dia:** Ao entrar, você cai no Dashboard ou Agenda, onde vê os atendimentos marcados.
- **Abrir uma OS Nova:** Vá no menu esquerdo "Ordens de Serviço" > clique em "Nova OS". Selecione o cliente na lista, escreva o problema e salve.
- **Fechando um Trabalho:** Na lista de Ordens, clique nos "três pontos" e vá em **Gerenciar**.
  - Você pode *Tirar Fotos* da instalação fazendo upload.
  - Quando finalizar o trabalho físico, clique em "Concluir", digite os equipamentos usados (modem, cabos) que o sistema descontará do estoque sozinho.
- **Esqueceu a senha?** Na tela de login clique em "Esqueci minha senha". Você receberá um código temporário de 6 dígitos no e-mail válido por 15 minutos.

---

## 16. Resumo Executivo

- **Quantidade de Telas Principais:** ~8 sub-módulos maiores (Dashboard, Agenda, Clientes, Atendentes, Técnicos, Materiais, OS e Login). Resultando em + de 20 páginas únicas renderizáveis.
- **Funcionalidades de Destaque:** 6 Macros (Autenticação, Gestão de OS Completa, Estoque, Auditoria, Integração Supabase, Recuperação E-mail).
- **Quantidade de Tabelas mapeadas:** 9.
- **Rotas Mapeadas pelo Router:** 25 rotas full-path.
- **Tecnologias:** React 19, Vite, TanStack, Drizzle, Postgres, Tailwind.
- **Status da Arquitetura:** Moderna, tipagem fim a fim estrita (TypeScript server+client integrados), voltada à alta performance e segurança com Zod.
