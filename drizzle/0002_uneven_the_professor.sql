CREATE TABLE "os_arquivos" (
	"id" serial PRIMARY KEY NOT NULL,
	"os_id" integer NOT NULL,
	"nome" text NOT NULL,
	"tipo_arquivo" text NOT NULL,
	"arquivo_path" text NOT NULL,
	"arquivo_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "os_arquivos" ADD CONSTRAINT "os_arquivos_os_id_ordens_servico_id_fk" FOREIGN KEY ("os_id") REFERENCES "public"."ordens_servico"("id") ON DELETE cascade ON UPDATE no action;