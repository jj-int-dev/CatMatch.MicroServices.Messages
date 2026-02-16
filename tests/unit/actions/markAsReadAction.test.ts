vi.mock('../../../src/commands/markAsReadCommand', () => ({
  markAsReadCommand: vi.fn()
}));

import { markAsReadAction } from '../../../src/actions/markAsReadAction';
import { markAsReadCommand } from '../../../src/commands/markAsReadCommand';
import HttpResponseError from '../../../src/dtos/httpResponseError';

describe('markAsReadAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should mark messages as read successfully', async () => {
    vi.mocked(markAsReadCommand).mockResolvedValue({
      success: true,
      updatedCount: 5
    });

    const result = await markAsReadAction('conv-id', 'user-id');

    expect(result.updatedCount).toBe(5);
  });

  it('should return 0 when no messages to mark', async () => {
    vi.mocked(markAsReadCommand).mockResolvedValue({
      success: true,
      updatedCount: 0
    });

    const result = await markAsReadAction('conv-id', 'user-id');

    expect(result.updatedCount).toBe(0);
  });

  it('should throw 404 error when conversation not found', async () => {
    vi.mocked(markAsReadCommand).mockResolvedValue({
      success: false,
      errorMsg: 'Conversation not found'
    });

    await expect(markAsReadAction('conv-id', 'user-id')).rejects.toThrow(
      HttpResponseError
    );

    try {
      await markAsReadAction('conv-id', 'user-id');
    } catch (error) {
      expect((error as HttpResponseError).statusCode).toBe(404);
    }
  });

  it('should throw 403 error when user is not a participant', async () => {
    vi.mocked(markAsReadCommand).mockResolvedValue({
      success: false,
      errorMsg: 'User is not a participant'
    });

    await expect(markAsReadAction('conv-id', 'user-id')).rejects.toThrow(
      HttpResponseError
    );

    try {
      await markAsReadAction('conv-id', 'user-id');
    } catch (error) {
      expect((error as HttpResponseError).statusCode).toBe(403);
    }
  });
});
