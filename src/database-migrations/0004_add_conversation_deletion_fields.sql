-- Migration: Add WhatsApp-style conversation deletion fields
-- Description: Adds adopter_deleted_at and rehomer_deleted_at timestamps for soft deletion
-- Date: 2026-02-13

-- Add deletion timestamp fields for per-user soft deletion
ALTER TABLE conversations
ADD COLUMN adopter_deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN rehomer_deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add indexes for efficient filtering of deleted conversations
CREATE INDEX idx_conversations_adopter_deleted ON conversations(adopter_id, adopter_deleted_at) WHERE adopter_deleted_at IS NULL;
CREATE INDEX idx_conversations_rehomer_deleted ON conversations(rehomer_id, rehomer_deleted_at) WHERE rehomer_deleted_at IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN conversations.adopter_deleted_at IS 'Timestamp when adopter soft-deleted this conversation. NULL means not deleted for adopter.';
COMMENT ON COLUMN conversations.rehomer_deleted_at IS 'Timestamp when rehomer soft-deleted this conversation. NULL means not deleted for rehomer.';
