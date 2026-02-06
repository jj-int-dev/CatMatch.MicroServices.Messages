import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../../src/commands/setTypingStatusCommand', () => ({
  setTypingStatusCommand: vi.fn()
}));

import { setTypingStatusAction } from '../../../src/actions/setTypingStatusAction';
import { setTypingStatusCommand } from '../../../src/commands/setTypingStatusCommand';
import HttpResponseError from '../../../src/dtos/httpResponseError';

describe('setTypingStatusAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set typing status successfully', async () => {
    vi.mocked(setTypingStatusCommand).mockResolvedValue({
      success: true
    });

    const result = await setTypingStatusAction('conv-id', 'user-id', true);

    expect(result.success).toBe(true);
  });

  it('should throw 404 error when conversation not found', async () => {
    vi.mocked(setTypingStatusCommand).mockResolvedValue({
      success: false,
      errorMsg: 'Conversation not found'
    });

    await expect(
      setTypingStatusAction('conv-id', 'user-id', true)
    ).rejects.toThrow(HttpResponseError);

    try {
      await setTypingStatusAction('conv-id', 'user-id', true);
    } catch (error) {
      expect((error as HttpResponseError).statusCode).toBe(404);
    }
  });

  it('should throw 403 error when user is not a participant', async () => {
    vi.mocked(setTypingStatusCommand).mockResolvedValue({
      success: false,
      errorMsg: 'User is not a participant'
    });

    await expect(
      setTypingStatusAction('conv-id', 'user-id', false)
    ).rejects.toThrow(HttpResponseError);

    try {
      await setTypingStatusAction('conv-id', 'user-id', false);
    } catch (error) {
      expect((error as HttpResponseError).statusCode).toBe(403);
    }
  });
});
