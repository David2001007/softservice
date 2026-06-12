# Unite 🛠️

Unite é uma plataforma moderna para gestão de ordens de serviço, atendentes, técnicos e materiais. Construída com as tecnologias mais recentes do ecossistema React e TanStack, focada em performance, tipagem forte e uma experiência de usuário premium.

## 🚀 Como Iniciar o Projeto

### Pré-requisitos

- **Node.js**: Versão 20 ou superior.
- **PNPM**: Recomendado como gerenciador de pacotes.
- **PostgreSQL**: Banco de dados para persistência.

### Passo a Passo

1. **Clonar o repositório:**

   ```bash
   git clone <url-do-repositorio>
   cd softservice
   ```

2. **Instalar dependências:**

   ```bash
   pnpm install
   ```

3. **Configurar variáveis de ambiente:**
   Crie um arquivo `.env.local` na raiz do projeto e adicione a URL do seu banco de dados:

   ```env
   DATABASE_URL="postgres://usuario:senha@localhost:5432/unite"
   ```

4. **Preparar o Banco de Dados:**
   Execute o comando para gerar as migrações e sincronizar o schema:

   ```bash
   pnpm db:setup
   ```

5. **Iniciar o servidor de desenvolvimento:**
   ```bash
   pnpm dev
   ```
   O projeto estará disponível em `http://localhost:3000`.

---

## 🛠️ Comandos do Banco de Dados (Drizzle)

- `pnpm db:generate`: Gera os arquivos de migração baseados no schema.
- `pnpm db:push`: Empurra as mudanças do schema diretamente para o banco (ideal para dev).
- `pnpm db:setup`: Atalho que executa `generate` e `push`.
- `pnpm db:studio`: Abre uma interface visual para explorar o banco de dados.

---

## 📐 Padrões de Desenvolvimento

### Arquitetura de Pastas (Feature-based)

O projeto segue uma estrutura baseada em funcionalidades (**Features**), localizada em `src/features`. Cada funcionalidade deve conter sua própria lógica, schemas e componentes específicos:

```text
src/
├── components/     # Componentes globais e UI (shadcn)
├── db/             # Configuração do banco e exportação do schema global
├── features/       # Funcionalidades de negócio (auth, clientes, materiais, etc.)
│   ├── [feature]/
│   │   ├── index.tsx   # Página/Componente principal da feature
│   │   ├── novo/       # Sub-rota de criação (opcional)
│   │   ├── editar/     # Sub-rota de edição (opcional)
│   │   ├── ver/        # Sub-rota de visualização (opcional)
│   │   ├── components/ # Componentes específicos da feature (opcional)
│   │   ├── schema.ts   # Definição Drizzle da tabela
│   │   └── server.ts   # Funções de servidor (Server Functions)
├── integrations/   # Integrações com bibliotecas externas (ex: TanStack Query)
├── lib/            # Utilitários e configurações compartilhadas
├── routes/         # Roteamento baseado em arquivos (TanStack Router)
└── stores/         # Gerenciamento de estado global (Zustand)
```

### Convenções de Código

1. **Tipagem**: TypeScript é obrigatório. Evite o uso de `any`. Utilize `zod` para validações.
2. **Estilização**: Utilizamos **Tailwind CSS**. Siga os padrões de design premium estabelecidos:
   - Use variáveis CSS para cores e tokens.
   - Prefira componentes do **Radix UI** para acessibilidade.
3. **Nomenclatura**:
   - Arquivos e pastas: `kebab-case`.
   - Componentes React: `PascalCase`.
   - Funções e variáveis: `camelCase`.
   - Tabelas do banco: `snake_case`.
4. **Data Fetching**:
   - Use **TanStack Query** para gerenciamento de estado assíncrono.
   - Use **Server Functions** do TanStack Start para operações de banco de dados.

### UI/UX Standards

- **Premium Aesthetics**: O design deve ser limpo, com uso de gradientes sutis, glassmorphism e micro-animações.
- **Responsividade**: Mobile-first sempre.
- **Feedback**: Sempre forneça feedback visual para ações do usuário (toasts via `sonner`, esqueletos de carregamento).

---

## 📝 Testes e Qualidade

- **Linting**: `pnpm lint`
- **Formatting**: `pnpm format`
- **Testes**: `pnpm test` (Vitest)

---

## 📄 Licença

Este projeto é de uso privado.
