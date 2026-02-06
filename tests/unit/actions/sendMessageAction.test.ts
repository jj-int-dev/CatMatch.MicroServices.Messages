import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/commands/sendMessageCommand', () => ({
  sendMessageCommand: vi.fn()
}));

import { sendMessageAction } from '../../../src/actions/sendMessageAction';
import { sendMessageCommand } from '../../../src/commands/sendMessageCommand';
import HttpResponseError from '../../../src/dtos/httpResponseError';

describe('sendMessageAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send message successfully', async () => {
    const mockMessage = {
      messageId: 'msg-id',
      conversationId: 'conv-id',
      senderId: 'sender-id',
      content: 'Hello!',
      createdAt: '2026-06-02T09:00:00.000Z',
      isRead: false,
      readAt: null
    };

    vi.mocked(sendMessageCommand).mockResolvedValue({
      success: true,
      data: mockMessage
    });

    const result = await sendMessageAction('conv-id', 'sender-id', 'Hello!');

    expect(result.message).toEqual(mockMessage);
  });

  it('should throw 404 error when conversation not found', async () => {
    vi.mocked(sendMessageCommand).mockResolvedValue({
      success: false,
      errorMsg: 'Conversation not found'
    });

    await expect(
      sendMessageAction('conv-id', 'sender-id', 'Hello!')
    ).rejects.toThrow(HttpResponseError);

    try {
      await sendMessageAction('conv-id', 'sender-id', 'Hello!');
    } catch (error) {
      expect((error as HttpResponseError).statusCode).toBe(404);
    }
  });

  it('should throw 403 error when user is not a participant', async () => {
    vi.mocked(sendMessageCommand).mockResolvedValue({
      success: false,
      errorMsg: 'User is not a participant in this conversation'
    });

    await expect(
      sendMessageAction('conv-id', 'sender-id', 'Hello!')
    ).rejects.toThrow(HttpResponseError);

    try {
      await sendMessageAction('conv-id', 'sender-id', 'Hello!');
    } catch (error) {
      expect((error as HttpResponseError).statusCode).toBe(403);
    }
  });
});
