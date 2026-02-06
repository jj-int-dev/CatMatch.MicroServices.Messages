import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/commands/getUnreadMessagesCountCommand', () => ({
  getUnreadMessagesCountCommand: vi.fn()
}));

import { getUnreadMessagesCountAction } from '../../../src/actions/getUnreadMessagesCountAction';
import { getUnreadMessagesCountCommand } from '../../../src/commands/getUnreadMessagesCountCommand';
import HttpResponseError from '../../../src/dtos/httpResponseError';

describe('getUnreadMessagesCountAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get unread count successfully', async () => {
    vi.mocked(getUnreadMessagesCountCommand).mockResolvedValue({
      success: true,
      unreadCount: 12
    });

    const result = await getUnreadMessagesCountAction('user-id');

    expect(result.unreadCount).toBe(12);
  });

  it('should return 0 for no unread messages', async () => {
    vi.mocked(getUnreadMessagesCountCommand).mockResolvedValue({
      success: true,
      unreadCount: 0
    });

    const result = await getUnreadMessagesCountAction('user-id');

    expect(result.unreadCount).toBe(0);
  });

  it('should throw 500 error on failure', async () => {
    vi.mocked(getUnreadMessagesCountCommand).mockResolvedValue({
      success: false,
      errorMsg: 'Database error'
    });

    await expect(getUnreadMessagesCountAction('user-id')).rejects.toThrow(
      HttpResponseError
    );
  });
});
