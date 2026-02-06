ALTER TABLE "auth"."audit_log_entries" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."flow_state" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."identities" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."instances" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."mfa_amr_claims" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."mfa_challenges" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."mfa_factors" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."one_time_tokens" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."refresh_tokens" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."saml_providers" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."saml_relay_states" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."schema_migrations" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."sessions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."sso_domains" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."sso_providers" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "auth"."users" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP INDEX "auth"."sso_domains_domain_idx";--> statement-breakpoint
DROP INDEX "auth"."sso_providers_resource_id_idx";--> statement-breakpoint
DROP INDEX "auth"."users_instance_id_email_idx";--> statement-breakpoint
ALTER TABLE "animals" ALTER COLUMN "address" SET DATA TYPE geometry(point);--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "rehomer_last_read_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "conversations" ADD COLUMN "adopter_last_read_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "messages" ADD COLUMN "is_read" boolean DEFAULT false NOT NULL;--> statement-breakpoint
CREATE INDEX "conversations_adopter_id_last_message_at_idx" ON "conversations" USING btree ("adopter_id" uuid_ops,"last_message_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "conversations_rehomer_id_last_message_at_idx" ON "conversations" USING btree ("rehomer_id" uuid_ops,"last_message_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages" USING btree ("conversation_id" uuid_ops,"created_at" timestamptz_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "sso_domains_domain_idx" ON "auth"."sso_domains" USING btree (lower(domain));--> statement-breakpoint
CREATE UNIQUE INDEX "sso_providers_resource_id_idx" ON "auth"."sso_providers" USING btree (lower(resource_id));--> statement-breakpoint
CREATE INDEX "users_instance_id_email_idx" ON "auth"."users" USING btree (instance_id,lower((email)::text));