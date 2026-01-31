CREATE TABLE "users" (
  "id" uuid PRIMARY KEY,
  "email" varchar UNIQUE NOT NULL,
  "password_hash" varchar NOT NULL,
  "first_name" varchar,
  "last_name" varchar,
  "avatar" varchar,
  "streak_count" int NOT NULL DEFAULT 0,
  "streak_active" boolean NOT NULL DEFAULT false,
  "coins_balance" int NOT NULL DEFAULT 0,
  "is_premium" boolean NOT NULL DEFAULT false,
  "created_at" timestamp NOT NULL,
  "created_by" uuid,
  "updated_at" timestamp NOT NULL,
  "updated_by" uuid,
  "deleted_at" timestamp,
  "deleted_by" uuid
);

CREATE TABLE "personality_profiles" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid UNIQUE NOT NULL,
  "personality_type" varchar NOT NULL,
  "traits" jsonb,
  "created_at" timestamp NOT NULL,
  "created_by" uuid,
  "updated_at" timestamp NOT NULL,
  "updated_by" uuid,
  "deleted_at" timestamp,
  "deleted_by" uuid
);

CREATE TABLE "journal_entries" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "entry_date" date NOT NULL,
  "entry_type" varchar NOT NULL,
  "content" text NOT NULL,
  "emotions" jsonb,
  "audio_url" varchar,
  "audio_duration_seconds" int,
  "transcription_text" text,
  "transcription_status" varchar,
  "created_at" timestamp NOT NULL,
  "created_by" uuid,
  "updated_at" timestamp NOT NULL,
  "updated_by" uuid,
  "deleted_at" timestamp,
  "deleted_by" uuid
);

CREATE TABLE "daily_tests" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "test_date" date NOT NULL,
  "answers" jsonb NOT NULL,
  "created_at" timestamp NOT NULL,
  "created_by" uuid,
  "updated_at" timestamp NOT NULL,
  "updated_by" uuid,
  "deleted_at" timestamp,
  "deleted_by" uuid
);

CREATE TABLE "daily_summaries" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "summary_date" date NOT NULL,
  "journal_entry_id" uuid UNIQUE NOT NULL,
  "ai_summary" text NOT NULL,
  "dominant_emotions" jsonb,
  "recommendations" text,
  "created_at" timestamp NOT NULL,
  "created_by" uuid,
  "updated_at" timestamp NOT NULL,
  "updated_by" uuid,
  "deleted_at" timestamp,
  "deleted_by" uuid
);

CREATE TABLE "tasks" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "title" varchar NOT NULL,
  "description" text,
  "task_at" timestamp NOT NULL,
  "priority" varchar NOT NULL,
  "category" varchar NOT NULL,
  "icon" varchar,
  "is_completed" boolean NOT NULL DEFAULT false,
  "completed_at" timestamp,
  "created_at" timestamp NOT NULL,
  "created_by" uuid,
  "updated_at" timestamp NOT NULL,
  "updated_by" uuid,
  "deleted_at" timestamp,
  "deleted_by" uuid
);

CREATE TABLE "task_recurrence" (
  "id" uuid PRIMARY KEY,
  "task_id" uuid UNIQUE NOT NULL,
  "rrule" text NOT NULL,
  "timezone" varchar NOT NULL,
  "recurrence_end_date" date,
  "recurrence_count" int,
  "created_at" timestamp NOT NULL,
  "created_by" uuid,
  "updated_at" timestamp NOT NULL,
  "updated_by" uuid,
  "deleted_at" timestamp,
  "deleted_by" uuid
);

CREATE TABLE "task_notifications" (
  "id" uuid PRIMARY KEY,
  "task_id" uuid NOT NULL,
  "notify_at" timestamp NOT NULL,
  "is_sent" boolean NOT NULL DEFAULT false,
  "sent_at" timestamp,
  "created_at" timestamp NOT NULL,
  "created_by" uuid,
  "updated_at" timestamp NOT NULL,
  "updated_by" uuid,
  "deleted_at" timestamp,
  "deleted_by" uuid
);

CREATE TABLE "ai_chat_sessions" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "title" varchar,
  "created_at" timestamp NOT NULL,
  "created_by" uuid,
  "updated_at" timestamp NOT NULL,
  "updated_by" uuid,
  "deleted_at" timestamp,
  "deleted_by" uuid
);

CREATE TABLE "ai_chat_messages" (
  "id" uuid PRIMARY KEY,
  "session_id" uuid NOT NULL,
  "sender" varchar NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamp NOT NULL,
  "created_by" uuid,
  "updated_at" timestamp NOT NULL,
  "updated_by" uuid,
  "deleted_at" timestamp,
  "deleted_by" uuid
);

CREATE TABLE "ai_chat_summaries" (
  "id" uuid PRIMARY KEY,
  "session_id" uuid NOT NULL,
  "summary" text NOT NULL,
  "model" varchar,
  "created_at" timestamp NOT NULL,
  "created_by" uuid,
  "updated_at" timestamp NOT NULL,
  "updated_by" uuid,
  "deleted_at" timestamp,
  "deleted_by" uuid
);

CREATE TABLE "streak_history" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "date" date NOT NULL,
  "action" varchar NOT NULL,
  "streak_value" int NOT NULL,
  "created_at" timestamp NOT NULL,
  "created_by" uuid,
  "updated_at" timestamp NOT NULL,
  "updated_by" uuid,
  "deleted_at" timestamp,
  "deleted_by" uuid
);

CREATE TABLE "coin_transactions" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "amount" int NOT NULL,
  "reason" varchar NOT NULL,
  "transaction_type" varchar NOT NULL,
  "created_at" timestamp NOT NULL,
  "created_by" uuid,
  "updated_at" timestamp NOT NULL,
  "updated_by" uuid,
  "deleted_at" timestamp,
  "deleted_by" uuid
);

CREATE TABLE "shop_items" (
  "id" uuid PRIMARY KEY,
  "name" varchar NOT NULL,
  "description" text,
  "price" int NOT NULL,
  "type" varchar NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL,
  "created_by" uuid,
  "updated_at" timestamp NOT NULL,
  "updated_by" uuid,
  "deleted_at" timestamp,
  "deleted_by" uuid
);

CREATE TABLE "user_items" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "item_id" uuid NOT NULL,
  "purchased_at" timestamp NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL,
  "created_by" uuid,
  "updated_at" timestamp NOT NULL,
  "updated_by" uuid,
  "deleted_at" timestamp,
  "deleted_by" uuid
);

CREATE TABLE "gardens" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "name" varchar NOT NULL,
  "created_at" timestamp NOT NULL,
  "created_by" uuid,
  "updated_at" timestamp NOT NULL,
  "updated_by" uuid,
  "deleted_at" timestamp,
  "deleted_by" uuid
);

CREATE TABLE "plant_catalog" (
  "id" uuid PRIMARY KEY,
  "name" varchar NOT NULL,
  "rarity" varchar NOT NULL,
  "grow_time_minutes" int NOT NULL,
  "coin_cost" int NOT NULL,
  "asset_url" varchar,
  "created_at" timestamp NOT NULL,
  "created_by" uuid,
  "updated_at" timestamp NOT NULL,
  "updated_by" uuid,
  "deleted_at" timestamp,
  "deleted_by" uuid
);

CREATE TABLE "garden_plots" (
  "id" uuid PRIMARY KEY,
  "garden_id" uuid NOT NULL,
  "plot_index" int NOT NULL,
  "created_at" timestamp NOT NULL,
  "created_by" uuid,
  "updated_at" timestamp NOT NULL,
  "updated_by" uuid,
  "deleted_at" timestamp,
  "deleted_by" uuid
);

CREATE TABLE "plantings" (
  "id" uuid PRIMARY KEY,
  "plot_id" uuid NOT NULL,
  "plant_id" uuid NOT NULL,
  "planted_at" timestamp NOT NULL,
  "ready_at" timestamp NOT NULL,
  "harvested_at" timestamp,
  "status" varchar NOT NULL,
  "created_at" timestamp NOT NULL,
  "created_by" uuid,
  "updated_at" timestamp NOT NULL,
  "updated_by" uuid,
  "deleted_at" timestamp,
  "deleted_by" uuid
);

CREATE TABLE "roles" (
  "id" uuid PRIMARY KEY,
  "name" varchar UNIQUE NOT NULL,
  "description" text,
  "created_at" timestamp NOT NULL,
  "created_by" uuid,
  "updated_at" timestamp NOT NULL,
  "updated_by" uuid,
  "deleted_at" timestamp,
  "deleted_by" uuid
);

CREATE TABLE "permissions" (
  "id" uuid PRIMARY KEY,
  "code" varchar UNIQUE NOT NULL,
  "description" text,
  "created_at" timestamp NOT NULL,
  "created_by" uuid,
  "updated_at" timestamp NOT NULL,
  "updated_by" uuid,
  "deleted_at" timestamp,
  "deleted_by" uuid
);

CREATE TABLE "role_permissions" (
  "id" uuid PRIMARY KEY,
  "role_id" uuid NOT NULL,
  "permission_id" uuid NOT NULL,
  "created_at" timestamp NOT NULL,
  "created_by" uuid,
  "updated_at" timestamp NOT NULL,
  "updated_by" uuid,
  "deleted_at" timestamp,
  "deleted_by" uuid
);

CREATE TABLE "user_roles" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "role_id" uuid NOT NULL,
  "created_at" timestamp NOT NULL,
  "created_by" uuid,
  "updated_at" timestamp NOT NULL,
  "updated_by" uuid,
  "deleted_at" timestamp,
  "deleted_by" uuid
);

CREATE TABLE "specialists" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid UNIQUE NOT NULL,
  "license_number" varchar,
  "specialization" varchar,
  "bio" text,
  "created_at" timestamp NOT NULL,
  "created_by" uuid,
  "updated_at" timestamp NOT NULL,
  "updated_by" uuid,
  "deleted_at" timestamp,
  "deleted_by" uuid
);

CREATE TABLE "user_specialist_access" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "specialist_id" uuid NOT NULL,
  "access_level" varchar NOT NULL,
  "granted_at" timestamp NOT NULL,
  "revoked_at" timestamp,
  "created_at" timestamp NOT NULL,
  "created_by" uuid,
  "updated_at" timestamp NOT NULL,
  "updated_by" uuid,
  "deleted_at" timestamp,
  "deleted_by" uuid
);

CREATE TABLE "subscription_plans" (
  "id" uuid PRIMARY KEY,
  "code" varchar UNIQUE NOT NULL,
  "name" varchar NOT NULL,
  "price_cents" int NOT NULL,
  "currency" varchar NOT NULL DEFAULT 'PLN',
  "interval" varchar NOT NULL,
  "is_active" boolean NOT NULL DEFAULT true,
  "created_at" timestamp NOT NULL,
  "created_by" uuid,
  "updated_at" timestamp NOT NULL,
  "updated_by" uuid,
  "deleted_at" timestamp,
  "deleted_by" uuid
);

CREATE TABLE "subscriptions" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "plan_id" uuid NOT NULL,
  "status" varchar NOT NULL,
  "start_at" timestamp NOT NULL,
  "current_period_start" timestamp NOT NULL,
  "current_period_end" timestamp NOT NULL,
  "cancel_at" timestamp,
  "canceled_at" timestamp,
  "created_at" timestamp NOT NULL,
  "created_by" uuid,
  "updated_at" timestamp NOT NULL,
  "updated_by" uuid,
  "deleted_at" timestamp,
  "deleted_by" uuid
);

CREATE TABLE "subscription_payments" (
  "id" uuid PRIMARY KEY,
  "subscription_id" uuid NOT NULL,
  "user_id" uuid NOT NULL,
  "amount_cents" int NOT NULL,
  "currency" varchar NOT NULL DEFAULT 'PLN',
  "provider" varchar NOT NULL,
  "provider_payment_id" varchar,
  "status" varchar NOT NULL,
  "paid_at" timestamp,
  "created_at" timestamp NOT NULL,
  "created_by" uuid,
  "updated_at" timestamp NOT NULL,
  "updated_by" uuid,
  "deleted_at" timestamp,
  "deleted_by" uuid
);

CREATE TABLE "invoices" (
  "id" uuid PRIMARY KEY,
  "user_id" uuid NOT NULL,
  "payment_id" uuid UNIQUE NOT NULL,
  "invoice_number" varchar UNIQUE NOT NULL,
  "issued_at" timestamp NOT NULL,
  "seller" jsonb NOT NULL,
  "buyer" jsonb NOT NULL,
  "lines" jsonb NOT NULL,
  "total_cents" int NOT NULL,
  "currency" varchar NOT NULL DEFAULT 'PLN',
  "pdf_url" varchar,
  "created_at" timestamp NOT NULL,
  "created_by" uuid,
  "updated_at" timestamp NOT NULL,
  "updated_by" uuid,
  "deleted_at" timestamp,
  "deleted_by" uuid
);

CREATE UNIQUE INDEX ON "users" ("email");

CREATE INDEX ON "journal_entries" ("user_id", "entry_date");

CREATE INDEX ON "journal_entries" ("user_id", "created_at");

CREATE UNIQUE INDEX ON "daily_tests" ("user_id", "test_date");

CREATE UNIQUE INDEX ON "daily_summaries" ("user_id", "summary_date");

CREATE INDEX ON "tasks" ("user_id", "task_at");

CREATE INDEX ON "tasks" ("user_id", "is_completed", "task_at");

CREATE INDEX ON "task_notifications" ("task_id", "notify_at");

CREATE INDEX ON "ai_chat_sessions" ("user_id", "created_at");

CREATE INDEX ON "ai_chat_messages" ("session_id", "created_at");

CREATE INDEX ON "ai_chat_summaries" ("session_id", "created_at");

CREATE UNIQUE INDEX ON "streak_history" ("user_id", "date");

CREATE INDEX ON "coin_transactions" ("user_id", "created_at");

CREATE UNIQUE INDEX ON "user_items" ("user_id", "item_id");

CREATE INDEX ON "user_items" ("user_id", "purchased_at");

CREATE INDEX ON "gardens" ("user_id");

CREATE UNIQUE INDEX ON "garden_plots" ("garden_id", "plot_index");

CREATE INDEX ON "plantings" ("plot_id", "planted_at");

CREATE UNIQUE INDEX ON "role_permissions" ("role_id", "permission_id");

CREATE UNIQUE INDEX ON "user_roles" ("user_id", "role_id");

CREATE UNIQUE INDEX ON "user_specialist_access" ("user_id", "specialist_id");

CREATE INDEX ON "subscriptions" ("user_id", "status");

CREATE INDEX ON "subscriptions" ("user_id", "current_period_end");

CREATE INDEX ON "subscription_payments" ("subscription_id", "created_at");

CREATE INDEX ON "subscription_payments" ("user_id", "created_at");

COMMENT ON COLUMN "personality_profiles"."personality_type" IS 'enum np.: supportive, balanced, direct';

COMMENT ON COLUMN "journal_entries"."entry_type" IS 'enum np.: text, voice, ai_note, summary';

COMMENT ON COLUMN "journal_entries"."transcription_status" IS 'enum np.: pending, done, failed';

COMMENT ON COLUMN "tasks"."priority" IS 'enum: low, medium, high';

COMMENT ON COLUMN "task_recurrence"."rrule" IS 'np. FREQ=WEEKLY;INTERVAL=1;BYDAY=MO,WE,FR';

COMMENT ON COLUMN "task_recurrence"."timezone" IS 'np. Europe/Warsaw';

COMMENT ON COLUMN "ai_chat_messages"."sender" IS 'enum: user, assistant, specialist';

COMMENT ON COLUMN "ai_chat_summaries"."model" IS 'np. gpt-4.1 / inny';

COMMENT ON COLUMN "streak_history"."action" IS 'enum: increment, reset, maintain';

COMMENT ON COLUMN "coin_transactions"."transaction_type" IS 'enum: earn, spend';

COMMENT ON COLUMN "shop_items"."type" IS 'enum: theme, avatar, feature, practice, premium_credit';

COMMENT ON COLUMN "gardens"."name" IS 'np. ''Mój ogród''';

COMMENT ON COLUMN "plant_catalog"."rarity" IS 'enum: common, rare, epic';

COMMENT ON COLUMN "plant_catalog"."coin_cost" IS 'koszt sadzonki, jeśli kupowana za coins';

COMMENT ON COLUMN "garden_plots"."plot_index" IS 'numer miejsca w ogrodzie';

COMMENT ON COLUMN "plantings"."status" IS 'enum: growing, ready, harvested';

COMMENT ON COLUMN "roles"."name" IS 'np. user, admin, specialist';

COMMENT ON COLUMN "permissions"."code" IS 'np. journal.read, journal.share, admin.manage_users';

COMMENT ON COLUMN "specialists"."user_id" IS 'specjalista to też konto user z rolą specialist';

COMMENT ON COLUMN "specialists"."specialization" IS 'psycholog/psychiatra/inne';

COMMENT ON COLUMN "user_specialist_access"."access_level" IS 'enum: summaries, journal, stats, full';

COMMENT ON COLUMN "subscription_plans"."code" IS 'np. premium_monthly, premium_yearly';

COMMENT ON COLUMN "subscription_plans"."interval" IS 'enum: month, year';

COMMENT ON COLUMN "subscriptions"."status" IS 'enum: active, canceled, past_due, trial';

COMMENT ON COLUMN "subscription_payments"."provider" IS 'np. stripe/payu/mock';

COMMENT ON COLUMN "subscription_payments"."status" IS 'enum: pending, paid, failed, refunded';

ALTER TABLE "personality_profiles" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "journal_entries" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "daily_tests" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "daily_summaries" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "daily_summaries" ADD FOREIGN KEY ("journal_entry_id") REFERENCES "journal_entries" ("id");

ALTER TABLE "tasks" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "task_recurrence" ADD FOREIGN KEY ("task_id") REFERENCES "tasks" ("id");

ALTER TABLE "task_notifications" ADD FOREIGN KEY ("task_id") REFERENCES "tasks" ("id");

ALTER TABLE "ai_chat_sessions" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "ai_chat_messages" ADD FOREIGN KEY ("session_id") REFERENCES "ai_chat_sessions" ("id");

ALTER TABLE "ai_chat_summaries" ADD FOREIGN KEY ("session_id") REFERENCES "ai_chat_sessions" ("id");

ALTER TABLE "streak_history" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "coin_transactions" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "user_items" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "user_items" ADD FOREIGN KEY ("item_id") REFERENCES "shop_items" ("id");

ALTER TABLE "gardens" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "garden_plots" ADD FOREIGN KEY ("garden_id") REFERENCES "gardens" ("id");

ALTER TABLE "plantings" ADD FOREIGN KEY ("plot_id") REFERENCES "garden_plots" ("id");

ALTER TABLE "plantings" ADD FOREIGN KEY ("plant_id") REFERENCES "plant_catalog" ("id");

ALTER TABLE "user_roles" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "user_roles" ADD FOREIGN KEY ("role_id") REFERENCES "roles" ("id");

ALTER TABLE "role_permissions" ADD FOREIGN KEY ("role_id") REFERENCES "roles" ("id");

ALTER TABLE "role_permissions" ADD FOREIGN KEY ("permission_id") REFERENCES "permissions" ("id");

ALTER TABLE "specialists" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "user_specialist_access" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "user_specialist_access" ADD FOREIGN KEY ("specialist_id") REFERENCES "specialists" ("id");

ALTER TABLE "subscriptions" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "subscriptions" ADD FOREIGN KEY ("plan_id") REFERENCES "subscription_plans" ("id");

ALTER TABLE "subscription_payments" ADD FOREIGN KEY ("subscription_id") REFERENCES "subscriptions" ("id");

ALTER TABLE "subscription_payments" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "invoices" ADD FOREIGN KEY ("user_id") REFERENCES "users" ("id");

ALTER TABLE "invoices" ADD FOREIGN KEY ("payment_id") REFERENCES "subscription_payments" ("id");
