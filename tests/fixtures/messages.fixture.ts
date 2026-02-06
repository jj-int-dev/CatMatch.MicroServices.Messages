export const mockMessage = {
  messageId: '111e2222-e89b-12d3-a456-426614174333',
  conversationId: '123e4567-e89b-12d3-a456-426614174000',
  senderId: 'adopter-uuid-1',
  content: 'Hello! Is the cat still available?',
  createdAt: '2026-06-02T09:00:00.000Z',
  isRead: false,
  readAt: null
};

export const mockMessageDbRow = {
  message_id: '111e2222-e89b-12d3-a456-426614174333',
  conversation_id: '123e4567-e89b-12d3-a456-426614174000',
  sender_id: 'adopter-uuid-1',
  content: 'Hello! Is the cat still available?',
  created_at: new Date('2026-06-02T09:00:00.000Z'),
  is_read: false,
  read_at: null
};

export const mockMessages = [mockMessage];
