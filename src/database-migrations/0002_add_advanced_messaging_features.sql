-- Add read_at timestamp to messages for detailed read receipts
ALTER TABLE "messages" ADD COLUMN "read_at" timestamp with time zone;

-- Add typing indicator fields to conversations
ALTER TABLE "conversations" ADD COLUMN "rehomer_is_typing" boolean DEFAULT false NOT NULL;
ALTER TABLE "conversations" ADD COLUMN "adopter_is_typing" boolean DEFAULT false NOT NULL;
ALTER TABLE "conversations" ADD COLUMN "rehomer_last_typing_at" timestamp with time zone;
ALTER TABLE "conversations" ADD COLUMN "adopter_last_typing_at" timestamp with time zone;

-- Create index for faster read status queries
CREATE INDEX "messages_conversation_id_read_at_idx" ON "messages" USING btree ("conversation_id" uuid_ops,"read_at" timestamptz_ops);

-- Update existing messages to set read_at based on is_read status and conversation last read times
-- This is a data migration that will set read_at for messages that were marked as read
-- Note: This is an approximation since we don't have exact read times historically
UPDATE "messages" m
SET "read_at" = 
  CASE 
    WHEN m.sender_id = c.adopter_id THEN c.adopter_last_read_at
    WHEN m.sender_id = c.rehomer_id THEN c.rehomer_last_read_at
    ELSE NULL
  END
FROM "conversations" c
WHERE m.conversation_id = c.conversation_id 
  AND m.is_read = true
  AND m.read_at IS NULL;