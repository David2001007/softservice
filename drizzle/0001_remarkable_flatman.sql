ALTER TYPE "public"."user_role" ADD VALUE 'supervisor';--> statement-breakpoint
CREATE TABLE "password_reset_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"code" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "tecnicos" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "ordens_servico" ADD COLUMN "speed_test_ping" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "ordens_servico" ADD COLUMN "speed_test_download" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "ordens_servico" ADD COLUMN "speed_test_upload" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "ordens_servico" ADD COLUMN "speed_test_data_hora" timestamp;--> statement-breakpoint
ALTER TABLE "tecnicos" ADD CONSTRAINT "tecnicos_email_unique" UNIQUE("email");