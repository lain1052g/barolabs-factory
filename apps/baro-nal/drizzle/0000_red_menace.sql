CREATE TABLE "br045_nal_records" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"recorded_date" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "br045_nal_users" (
	"supabase_id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"avatar_url" text,
	"plan" varchar(10) DEFAULT 'free' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "br045_nal_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "br045_nal_records" ADD CONSTRAINT "br045_nal_records_user_id_br045_nal_users_supabase_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."br045_nal_users"("supabase_id") ON DELETE cascade ON UPDATE no action;