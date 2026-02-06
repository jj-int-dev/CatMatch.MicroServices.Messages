import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/commands/getConversationsCommand', () => ({
  getConversationsCommand: vi.fn()
}));

import { getConversationsAction } from '../../../src/actions/getConversationsAction';
import { getConversationsCommand } from '../../../src/commands/getConversationsCommand';
import HttpResponseError from '../../../src/dtos/httpResponseError';

describe('getConversationsAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get conversations successfully', async () => {
    const mockConversations = [
      {
        conversationId: 'conv-1',
        adopterId: 'user-id',
        rehomerId: 'other-user',
        animalId: null,
        createdAt: '2026-06-01T10:00:00.000Z',
        lastMessageAt: null,
        adopterLastActiveAt: '2026-06-01T10:00:00.000Z',
        rehomerLastActiveAt: '2026-06-01T10:00:00.000Z',
        adopterLastReadAt: null,
        rehomerLastReadAt: null,
        otherUserName: 'John',
        otherUserProfilePicture: null,
        unreadCount: 0,
        animalName: null,
        animalPhoto: null
      }
    ];

    vi.mocked(getConversationsCommand).mockResolvedValue({
      success: true,
      data: mockConversations,
      totalResults: 15,
      page: 1,
      pageSize: 20
    });

    const result = await getConversationsAction('user-id', 1, 20);

    expect(result.conversations).toEqual(mockConversations);
    expect(result.pagination.totalResults).toBe(15);
    expect(result.pagination.totalPages).toBe(1);
  });

  it('should throw 500 error on failure', async () => {
    vi.mocked(getConversationsCommand).mockResolvedValue({
      success: false,
      errorMsg: 'Database error'
    });

    await expect(getConversationsAction('user-id', 1, 20)).rejects.toThrow(
      HttpResponseError
    );
  });
});
