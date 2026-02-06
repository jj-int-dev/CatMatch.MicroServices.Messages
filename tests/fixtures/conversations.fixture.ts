export const mockConversation = {
  conversationId: '123e4567-e89b-12d3-a456-426614174000',
  adopterId: 'adopter-uuid-1',
  rehomerId: 'rehomer-uuid-1',
  animalId: 'animal-uuid-1',
  createdAt: '2026-06-01T10:00:00.000Z',
  lastMessageAt: '2026-06-02T09:15:00.000Z',
  adopterLastActiveAt: '2026-06-02T09:15:00.000Z',
  rehomerLastActiveAt: '2026-06-02T09:10:00.000Z',
  adopterLastReadAt: '2026-06-02T09:00:00.000Z',
  rehomerLastReadAt: '2026-06-02T09:05:00.000Z',
  otherUserName: 'John Doe',
  otherUserProfilePicture: 'https://example.com/photo.jpg',
  unreadCount: 3,
  animalName: 'Whiskers',
  animalPhoto: 'https://example.com/cat.jpg'
};

export const mockConversationDbRow = {
  conversation_id: '123e4567-e89b-12d3-a456-426614174000',
  adopter_id: 'adopter-uuid-1',
  rehomer_id: 'rehomer-uuid-1',
  animal_id: 'animal-uuid-1',
  created_at: new Date('2026-06-01T10:00:00.000Z'),
  last_message_at: new Date('2026-06-02T09:15:00.000Z'),
  adopter_last_active_at: new Date('2026-06-02T09:15:00.000Z'),
  rehomer_last_active_at: new Date('2026-06-02T09:10:00.000Z'),
  adopter_last_read_at: new Date('2026-06-02T09:00:00.000Z'),
  rehomer_last_read_at: new Date('2026-06-02T09:05:00.000Z')
};

export const mockConversations = [mockConversation];
