CREATE TABLE "br-s15_menoa_content_bookmarks" (
	"id" text PRIMARY KEY NOT NULL,
	"author_id" text NOT NULL,
	"author_supabase_id" text NOT NULL,
	"content_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "br-s15_menoa_expert_contents" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"category" text NOT NULL,
	"author_name" text NOT NULL,
	"author_title" text,
	"reviewed_by" text,
	"reviewed_at" timestamp,
	"is_published" boolean DEFAULT false NOT NULL,
	"is_pro_only" boolean DEFAULT false NOT NULL,
	"thumbnail_url" text,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "br-s15_menoa_mood_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"author_id" text NOT NULL,
	"author_supabase_id" text NOT NULL,
	"log_date" date NOT NULL,
	"mood_emoji" text NOT NULL,
	"mood_score" integer NOT NULL,
	"note" text,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "br-s15_menoa_pdf_reports" (
	"id" text PRIMARY KEY NOT NULL,
	"author_id" text NOT NULL,
	"author_supabase_id" text NOT NULL,
	"period_start" date NOT NULL,
	"period_end" date NOT NULL,
	"report_type" text NOT NULL,
	"file_url" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "br-s15_menoa_push_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"author_id" text NOT NULL,
	"author_supabase_id" text NOT NULL,
	"token" text NOT NULL,
	"platform" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "br-s15_menoa_sos_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"author_id" text NOT NULL,
	"author_supabase_id" text NOT NULL,
	"triggered_at" timestamp DEFAULT now() NOT NULL,
	"symptom_type" text,
	"content_shown" text,
	"duration_seconds" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "br-s15_menoa_subscriptions" (
	"id" text PRIMARY KEY NOT NULL,
	"author_id" text NOT NULL,
	"author_supabase_id" text NOT NULL,
	"plan" text NOT NULL,
	"billing_cycle" text,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp,
	"portone_payment_id" text,
	"portone_subscription_id" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "br-s15_menoa_symptom_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_en" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "br-s15_menoa_symptom_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"author_id" text NOT NULL,
	"author_supabase_id" text NOT NULL,
	"symptom_id" text NOT NULL,
	"log_date" date NOT NULL,
	"severity" integer NOT NULL,
	"note" text,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "br-s15_menoa_symptoms" (
	"id" text PRIMARY KEY NOT NULL,
	"category_id" text NOT NULL,
	"name" text NOT NULL,
	"name_en" text,
	"description" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "br-s15_menoa_trigger_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"author_id" text NOT NULL,
	"author_supabase_id" text NOT NULL,
	"log_date" date NOT NULL,
	"caffeine_cups" integer DEFAULT 0 NOT NULL,
	"alcohol_units" integer DEFAULT 0 NOT NULL,
	"sleep_minutes" integer DEFAULT 0 NOT NULL,
	"stress_level" integer,
	"exercise_minutes" integer DEFAULT 0 NOT NULL,
	"note" text,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "br-s15_menoa_users" (
	"id" text PRIMARY KEY NOT NULL,
	"supabase_id" text NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"plan" text DEFAULT 'free' NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"menopause_stage" text,
	"last_period_date" date,
	"birth_year" integer,
	"pro_expires_at" timestamp,
	"upload_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "br-s15_menoa_users_supabase_id_unique" UNIQUE("supabase_id"),
	CONSTRAINT "br-s15_menoa_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "br-s15_menoa_content_bookmarks" ADD CONSTRAINT "br-s15_menoa_content_bookmarks_author_id_br-s15_menoa_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."br-s15_menoa_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "br-s15_menoa_content_bookmarks" ADD CONSTRAINT "br-s15_menoa_content_bookmarks_content_id_br-s15_menoa_expert_contents_id_fk" FOREIGN KEY ("content_id") REFERENCES "public"."br-s15_menoa_expert_contents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "br-s15_menoa_mood_logs" ADD CONSTRAINT "br-s15_menoa_mood_logs_author_id_br-s15_menoa_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."br-s15_menoa_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "br-s15_menoa_pdf_reports" ADD CONSTRAINT "br-s15_menoa_pdf_reports_author_id_br-s15_menoa_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."br-s15_menoa_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "br-s15_menoa_push_tokens" ADD CONSTRAINT "br-s15_menoa_push_tokens_author_id_br-s15_menoa_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."br-s15_menoa_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "br-s15_menoa_sos_logs" ADD CONSTRAINT "br-s15_menoa_sos_logs_author_id_br-s15_menoa_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."br-s15_menoa_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "br-s15_menoa_subscriptions" ADD CONSTRAINT "br-s15_menoa_subscriptions_author_id_br-s15_menoa_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."br-s15_menoa_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "br-s15_menoa_symptom_logs" ADD CONSTRAINT "br-s15_menoa_symptom_logs_author_id_br-s15_menoa_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."br-s15_menoa_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "br-s15_menoa_symptom_logs" ADD CONSTRAINT "br-s15_menoa_symptom_logs_symptom_id_br-s15_menoa_symptoms_id_fk" FOREIGN KEY ("symptom_id") REFERENCES "public"."br-s15_menoa_symptoms"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "br-s15_menoa_symptoms" ADD CONSTRAINT "br-s15_menoa_symptoms_category_id_br-s15_menoa_symptom_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."br-s15_menoa_symptom_categories"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "br-s15_menoa_trigger_logs" ADD CONSTRAINT "br-s15_menoa_trigger_logs_author_id_br-s15_menoa_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."br-s15_menoa_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "menoa_bookmarks_unique" ON "br-s15_menoa_content_bookmarks" USING btree ("author_id","content_id");--> statement-breakpoint
CREATE INDEX "menoa_bookmarks_author_idx" ON "br-s15_menoa_content_bookmarks" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "menoa_bookmarks_supabase_idx" ON "br-s15_menoa_content_bookmarks" USING btree ("author_supabase_id");--> statement-breakpoint
CREATE INDEX "menoa_expert_contents_category_idx" ON "br-s15_menoa_expert_contents" USING btree ("category");--> statement-breakpoint
CREATE INDEX "menoa_expert_contents_published_idx" ON "br-s15_menoa_expert_contents" USING btree ("is_published");--> statement-breakpoint
CREATE INDEX "menoa_expert_contents_deleted_idx" ON "br-s15_menoa_expert_contents" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "menoa_mood_logs_author_idx" ON "br-s15_menoa_mood_logs" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "menoa_mood_logs_supabase_idx" ON "br-s15_menoa_mood_logs" USING btree ("author_supabase_id");--> statement-breakpoint
CREATE INDEX "menoa_mood_logs_date_idx" ON "br-s15_menoa_mood_logs" USING btree ("log_date");--> statement-breakpoint
CREATE INDEX "menoa_mood_logs_deleted_idx" ON "br-s15_menoa_mood_logs" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "menoa_mood_logs_author_date_idx" ON "br-s15_menoa_mood_logs" USING btree ("author_id","log_date");--> statement-breakpoint
CREATE UNIQUE INDEX "menoa_mood_logs_unique_date" ON "br-s15_menoa_mood_logs" USING btree ("author_id","log_date");--> statement-breakpoint
CREATE INDEX "menoa_pdf_reports_author_idx" ON "br-s15_menoa_pdf_reports" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "menoa_pdf_reports_supabase_idx" ON "br-s15_menoa_pdf_reports" USING btree ("author_supabase_id");--> statement-breakpoint
CREATE INDEX "menoa_pdf_reports_period_idx" ON "br-s15_menoa_pdf_reports" USING btree ("period_start");--> statement-breakpoint
CREATE UNIQUE INDEX "menoa_push_tokens_token_unique" ON "br-s15_menoa_push_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "menoa_push_tokens_author_idx" ON "br-s15_menoa_push_tokens" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "menoa_push_tokens_supabase_idx" ON "br-s15_menoa_push_tokens" USING btree ("author_supabase_id");--> statement-breakpoint
CREATE INDEX "menoa_sos_logs_author_idx" ON "br-s15_menoa_sos_logs" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "menoa_sos_logs_supabase_idx" ON "br-s15_menoa_sos_logs" USING btree ("author_supabase_id");--> statement-breakpoint
CREATE INDEX "menoa_sos_logs_triggered_idx" ON "br-s15_menoa_sos_logs" USING btree ("triggered_at");--> statement-breakpoint
CREATE INDEX "menoa_subscriptions_author_idx" ON "br-s15_menoa_subscriptions" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "menoa_subscriptions_supabase_idx" ON "br-s15_menoa_subscriptions" USING btree ("author_supabase_id");--> statement-breakpoint
CREATE INDEX "menoa_subscriptions_status_idx" ON "br-s15_menoa_subscriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "menoa_symptom_logs_author_idx" ON "br-s15_menoa_symptom_logs" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "menoa_symptom_logs_supabase_idx" ON "br-s15_menoa_symptom_logs" USING btree ("author_supabase_id");--> statement-breakpoint
CREATE INDEX "menoa_symptom_logs_date_idx" ON "br-s15_menoa_symptom_logs" USING btree ("log_date");--> statement-breakpoint
CREATE INDEX "menoa_symptom_logs_deleted_idx" ON "br-s15_menoa_symptom_logs" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "menoa_symptom_logs_author_date_idx" ON "br-s15_menoa_symptom_logs" USING btree ("author_id","log_date");--> statement-breakpoint
CREATE INDEX "menoa_symptoms_category_idx" ON "br-s15_menoa_symptoms" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "menoa_trigger_logs_author_idx" ON "br-s15_menoa_trigger_logs" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "menoa_trigger_logs_supabase_idx" ON "br-s15_menoa_trigger_logs" USING btree ("author_supabase_id");--> statement-breakpoint
CREATE INDEX "menoa_trigger_logs_date_idx" ON "br-s15_menoa_trigger_logs" USING btree ("log_date");--> statement-breakpoint
CREATE INDEX "menoa_trigger_logs_deleted_idx" ON "br-s15_menoa_trigger_logs" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "menoa_trigger_logs_author_date_idx" ON "br-s15_menoa_trigger_logs" USING btree ("author_id","log_date");--> statement-breakpoint
CREATE UNIQUE INDEX "menoa_trigger_logs_unique_date" ON "br-s15_menoa_trigger_logs" USING btree ("author_id","log_date");--> statement-breakpoint
CREATE INDEX "menoa_users_supabase_id_idx" ON "br-s15_menoa_users" USING btree ("supabase_id");--> statement-breakpoint
CREATE INDEX "menoa_users_plan_idx" ON "br-s15_menoa_users" USING btree ("plan");