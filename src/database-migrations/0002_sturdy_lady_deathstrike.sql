ALTER TABLE "animals_adopted" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "notifications" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "animals_adopted" CASCADE;--> statement-breakpoint
DROP TABLE "notifications" CASCADE;--> statement-breakpoint
DROP INDEX "conversations_adopter_id_last_message_at_idx";--> statement-breakpoint
DROP INDEX "conversations_rehomer_id_last_message_at_idx";--> statement-breakpoint
DROP INDEX "messages_conversation_id_created_at_idx";--> statement-breakpoint
ALTER TABLE "auth"."flow_state" ALTER COLUMN "auth_code" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "auth"."flow_state" ALTER COLUMN "code_challenge_method" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "auth"."flow_state" ALTER COLUMN "code_challenge" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "user_type_id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "user_type_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "animal_id" uuid DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "adopter_is_typing" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "rehomer_is_typing" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "adopter_last_typing_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "rehomer_last_typing_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "adopter_deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "rehomer_deleted_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "auth"."flow_state" ADD COLUMN "invite_token" text;--> statement-breakpoint
ALTER TABLE "auth"."flow_state" ADD COLUMN "referrer" text;--> statement-breakpoint
ALTER TABLE "auth"."flow_state" ADD COLUMN "oauth_client_state_id" uuid;--> statement-breakpoint
ALTER TABLE "auth"."flow_state" ADD COLUMN "linking_target_id" uuid;--> statement-breakpoint
ALTER TABLE "auth"."flow_state" ADD COLUMN "email_optional" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "read_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "auth"."oauth_clients" ADD COLUMN "token_endpoint_auth_method" text NOT NULL;--> statement-breakpoint
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_animal_id_fkey" FOREIGN KEY ("animal_id") REFERENCES "public"."animals"("animal_id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "idx_conversations_adopter" ON "conversations" USING btree ("adopter_id" uuid_ops,"last_message_at" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_conversations_adopter_deleted" ON "conversations" USING btree ("adopter_id" timestamptz_ops,"adopter_deleted_at" timestamptz_ops) WHERE (adopter_deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_conversations_last_message" ON "conversations" USING btree ("last_message_at" timestamptz_ops,"created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_conversations_rehomer" ON "conversations" USING btree ("rehomer_id" timestamptz_ops,"last_message_at" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_conversations_rehomer_deleted" ON "conversations" USING btree ("rehomer_id" timestamptz_ops,"rehomer_deleted_at" uuid_ops) WHERE (rehomer_deleted_at IS NULL);--> statement-breakpoint
CREATE INDEX "idx_conversations_typing_status" ON "conversations" USING btree ("adopter_is_typing" bool_ops,"rehomer_is_typing" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_messages_conversation_created" ON "messages" USING btree ("conversation_id" uuid_ops,"created_at" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_messages_conversation_unread" ON "messages" USING btree ("conversation_id" bool_ops,"is_read" bool_ops,"sender_id" bool_ops) WHERE (is_read = false);--> statement-breakpoint
CREATE INDEX "idx_messages_read_at" ON "messages" USING btree ("read_at" timestamptz_ops) WHERE (read_at IS NOT NULL);--> statement-breakpoint
CREATE INDEX "conversations_adopter_id_last_message_at_idx" ON "conversations" USING btree ("adopter_id" timestamptz_ops,"last_message_at" uuid_ops);--> statement-breakpoint
CREATE INDEX "conversations_rehomer_id_last_message_at_idx" ON "conversations" USING btree ("rehomer_id" timestamptz_ops,"last_message_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages" USING btree ("conversation_id" timestamptz_ops,"created_at" uuid_ops);--> statement-breakpoint
ALTER TABLE "auth"."oauth_clients" ADD CONSTRAINT "oauth_clients_token_endpoint_auth_method_check" CHECK (token_endpoint_auth_method = ANY (ARRAY['client_secret_basic'::text, 'client_secret_post'::text, 'none'::text]));