ALTER TABLE "materiais" ADD COLUMN "assigned_tecnico_id" integer;--> statement-breakpoint
ALTER TABLE "materiais" ADD CONSTRAINT "materiais_assigned_tecnico_id_tecnicos_id_fk" FOREIGN KEY ("assigned_tecnico_id") REFERENCES "public"."tecnicos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "materiais" DROP COLUMN "tipo_controle_estoque";--> statement-breakpoint
DROP TYPE "public"."material_tipo_controle_estoque";