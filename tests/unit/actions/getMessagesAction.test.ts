import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/commands/getMessagesCommand', () => ({
  getMessagesCommand: vi.fn()
}));

import { getMessagesAction } from '../../../src/actions/getMessagesAction';
import { getMessagesCommand } from '../../../src/commands/getMessagesCommand';
import HttpResponseError from '../../../src/dtos/httpResponseError';

describe('getMessagesAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get messages successfully', async () => {
    const mockMessages = [
      {
        messageId: 'msg-1',
        conversationId: 'conv-id',
        senderId: 'user-id',
        content: 'Hello',
        createdAt: '2026-06-02T09:00:00.000Z',
        isRead: false,
        readAt: null
      }
    ];

    vi.mocked(getMessagesCommand).mockResolvedValue({
      success: true,
      data: mockMessages,
      totalResults: 42,
      page: 1,
      pageSize: 20
    });

    const result = await getMessagesAction('conv-id', 'user-id', 1, 20);

    expect(result.messages).toEqual(mockMessages);
    expect(result.pagination.totalResults).toBe(42);
    expect(result.pagination.totalPages).toBe(3);
  });

  it('should throw 404 error when conversation not found', async () => {
    vi.mocked(getMessagesCommand).mockResolvedValue({
      success: false,
      errorMsg: 'Conversation not found'
    });

    await expect(
      getMessagesAction('conv-id', 'user-id', 1, 20)
    ).rejects.toThrow(HttpResponseError);

    try {
      await getMessagesAction('conv-id', 'user-id', 1, 20);
    } catch (error) {
      expect((error as HttpResponseError).statusCode).toBe(404);
    }
  });

  it('should throw 403 error when user is not a participant', async () => {
    vi.mocked(getMessagesCommand).mockResolvedValue({
      success: false,
      errorMsg: 'User is not a participant'
    });

    await expect(
      getMessagesAction('conv-id', 'user-id', 1, 20)
    ).rejects.toThrow(HttpResponseError);

    try {
      await getMessagesAction('conv-id', 'user-id', 1, 20);
    } catch (error) {
      expect((error as HttpResponseError).statusCode).toBe(403);
    }
  });
});
