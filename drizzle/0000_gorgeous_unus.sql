CREATE TYPE "public"."cliente_status" AS ENUM('ativo', 'inativo');--> statement-breakpoint
CREATE TYPE "public"."contrato_situacao" AS ENUM('assinado', 'nao_assinado');--> statement-breakpoint
CREATE TYPE "public"."local_saida" AS ENUM('estoque_principal', 'estoque_tecnico');--> statement-breakpoint
CREATE TYPE "public"."material_status" AS ENUM('ativo', 'inativo');--> statement-breakpoint
CREATE TYPE "public"."os_acao_historico" AS ENUM('criacao', 'agendamento', 'mudanca_tecnico', 'reagendamento', 'cancelamento', 'conclusao', 'atualizacao');--> statement-breakpoint
CREATE TYPE "public"."os_prioridade" AS ENUM('baixa', 'normal', 'alta');--> statement-breakpoint
CREATE TYPE "public"."os_status" AS ENUM('aberta', 'agendada', 'em_execucao', 'concluida', 'cancelada', 'reagendada', 'pendente');--> statement-breakpoint
CREATE TYPE "public"."os_tipo_servico" AS ENUM('instalacao', 'manutencao', 'troca_equipamento', 'infra', 'outro');--> statement-breakpoint
CREATE TYPE "public"."tecnico_perfil" AS ENUM('tecnico', 'supervisor');--> statement-breakpoint
CREATE TYPE "public"."tecnico_tipo" AS ENUM('interno', 'terceiro');--> statement-breakpoint
CREATE TYPE "public"."tipo_uso_material" AS ENUM('comodato', 'venda', 'uso_interno');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'atendente');--> statement-breakpoint
CREATE TABLE "clientes" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo" text NOT NULL,
	"nome" text NOT NULL,
	"cpf_cnpj" text NOT NULL,
	"telefone" text NOT NULL,
	"cep" text,
	"logradouro" text,
	"numero" text,
	"complemento" text,
	"bairro" text,
	"cidade" text,
	"uf" text,
	"referencia" text,
	"plano" text,
	"situacao_contrato" "contrato_situacao" DEFAULT 'nao_assinado',
	"status" "cliente_status" DEFAULT 'ativo' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "clientes_codigo_unique" UNIQUE("codigo"),
	CONSTRAINT "clientes_cpf_cnpj_unique" UNIQUE("cpf_cnpj")
);
--> statement-breakpoint
CREATE TABLE "materiais" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo" text NOT NULL,
	"descricao" text NOT NULL,
	"categoria" text NOT NULL,
	"unidade" text NOT NULL,
	"quantidade" numeric(12, 3) DEFAULT '0' NOT NULL,
	"estoque_minimo" numeric(12, 3) DEFAULT '0' NOT NULL,
	"comodato" boolean DEFAULT false NOT NULL,
	"status" "material_status" DEFAULT 'ativo' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "materiais_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "ordens_servico" (
	"id" serial PRIMARY KEY NOT NULL,
	"numero" text NOT NULL,
	"data_abertura" timestamp DEFAULT now() NOT NULL,
	"criado_por_id" integer,
	"cliente_id" integer NOT NULL,
	"tipo_servico" "os_tipo_servico" NOT NULL,
	"descricao_problema" text,
	"observacoes" text,
	"prioridade" "os_prioridade" DEFAULT 'normal' NOT NULL,
	"data_agendada" timestamp,
	"tecnico_id" integer,
	"valor" numeric(10, 2),
	"status" "os_status" DEFAULT 'aberta' NOT NULL,
	"data_inicio_efetivo" timestamp,
	"data_termino_efetivo" timestamp,
	"resultado_servico" boolean,
	"observacoes_finais" text,
	"motivo_reagendamento" text,
	"nova_data_agendada" timestamp,
	"motivo_cancelamento" text,
	"responsavel_cancelamento_id" integer,
	"data_cancelamento" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "ordens_servico_numero_unique" UNIQUE("numero")
);
--> statement-breakpoint
CREATE TABLE "os_historico" (
	"id" serial PRIMARY KEY NOT NULL,
	"os_id" integer NOT NULL,
	"data_hora" timestamp DEFAULT now() NOT NULL,
	"usuario_id" integer,
	"acao" "os_acao_historico" NOT NULL,
	"status_anterior" "os_status",
	"status_novo" "os_status",
	"motivo" text,
	"detalhes" text
);
--> statement-breakpoint
CREATE TABLE "os_materiais" (
	"id" serial PRIMARY KEY NOT NULL,
	"os_id" integer NOT NULL,
	"material_id" integer NOT NULL,
	"quantidade" numeric(12, 3) NOT NULL,
	"tipo_uso" "tipo_uso_material" DEFAULT 'uso_interno' NOT NULL,
	"local_saida" "local_saida" DEFAULT 'estoque_principal' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tecnicos" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo" text NOT NULL,
	"nome" text NOT NULL,
	"tipo" "tecnico_tipo" DEFAULT 'interno' NOT NULL,
	"empresa" text,
	"cnpj" text,
	"telefone" text NOT NULL,
	"email" text,
	"regiao" text,
	"especialidade" text,
	"perfil" "tecnico_perfil" DEFAULT 'tecnico' NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tecnicos_codigo_unique" UNIQUE("codigo"),
	CONSTRAINT "tecnicos_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo" text NOT NULL,
	"nome" text NOT NULL,
	"cpf" text NOT NULL,
	"email" text NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" "user_role" DEFAULT 'atendente' NOT NULL,
	"ativo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_codigo_unique" UNIQUE("codigo"),
	CONSTRAINT "users_cpf_unique" UNIQUE("cpf"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_criado_por_id_users_id_fk" FOREIGN KEY ("criado_por_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_cliente_id_clientes_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_tecnico_id_tecnicos_id_fk" FOREIGN KEY ("tecnico_id") REFERENCES "public"."tecnicos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ordens_servico" ADD CONSTRAINT "ordens_servico_responsavel_cancelamento_id_users_id_fk" FOREIGN KEY ("responsavel_cancelamento_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "os_historico" ADD CONSTRAINT "os_historico_os_id_ordens_servico_id_fk" FOREIGN KEY ("os_id") REFERENCES "public"."ordens_servico"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "os_historico" ADD CONSTRAINT "os_historico_usuario_id_users_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "os_materiais" ADD CONSTRAINT "os_materiais_os_id_ordens_servico_id_fk" FOREIGN KEY ("os_id") REFERENCES "public"."ordens_servico"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "os_materiais" ADD CONSTRAINT "os_materiais_material_id_materiais_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materiais"("id") ON DELETE no action ON UPDATE no action;