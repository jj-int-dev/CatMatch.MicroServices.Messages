-- Add optimized indexes for unread count queries
-- This partial index targets only unread messages, significantly improving query performance
-- when counting unread messages per conversation

-- Index for efficient unread message counting
-- Only indexes rows where is_read = false, making the index smaller and faster
CREATE INDEX IF NOT EXISTS "idx_messages_conversation_unread" 
ON "messages" ("conversation_id", "is_read", "sender_id") 
WHERE "is_read" = false;

-- Additional composite index for conversation queries with ordering
-- Helps with queries that fetch conversations ordered by last_message_at
CREATE INDEX IF NOT EXISTS "idx_conversations_last_message" 
ON "conversations" ("last_message_at" DESC NULLS LAST, "created_at" DESC);

-- Index for user's conversations (improves filtering by adopter or rehomer)
CREATE INDEX IF NOT EXISTS "idx_conversations_adopter" 
ON "conversations" ("adopter_id", "last_message_at" DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS "idx_conversations_rehomer" 
ON "conversations" ("rehomer_id", "last_message_at" DESC NULLS LAST);

-- Index for messages ordered by creation time within a conversation
-- Improves pagination and message retrieval
CREATE INDEX IF NOT EXISTS "idx_messages_conversation_created" 
ON "messages" ("conversation_id", "created_at" DESC);
