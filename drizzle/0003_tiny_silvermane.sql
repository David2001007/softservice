CREATE TYPE "public"."estoque_movimentacao_tipo" AS ENUM('ENTRADA', 'SAIDA_OS', 'AJUSTE');--> statement-breakpoint
CREATE TYPE "public"."material_tipo_controle_estoque" AS ENUM('UNIDADE', 'METRO');--> statement-breakpoint
CREATE TABLE "estoque_movimentacoes" (
	"id" serial PRIMARY KEY NOT NULL,
	"material_id" integer NOT NULL,
	"tipo" "estoque_movimentacao_tipo" NOT NULL,
	"quantidade" numeric(12, 3) NOT NULL,
	"ordem_servico_id" integer,
	"usuario_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "materiais" ADD COLUMN "tipo_controle_estoque" "material_tipo_controle_estoque" DEFAULT 'UNIDADE' NOT NULL;--> statement-breakpoint
ALTER TABLE "estoque_movimentacoes" ADD CONSTRAINT "estoque_movimentacoes_material_id_materiais_id_fk" FOREIGN KEY ("material_id") REFERENCES "public"."materiais"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "estoque_movimentacoes" ADD CONSTRAINT "estoque_movimentacoes_ordem_servico_id_ordens_servico_id_fk" FOREIGN KEY ("ordem_servico_id") REFERENCES "public"."ordens_servico"("id") ON DELETE no action ON UPDATE no action;