vi.mock('../../../src/commands/deleteConversationsForUserCommand', () => ({
  default: vi.fn()
}));

import { deleteConversationsForUserAction } from '../../../src/actions/deleteConversationsForUserAction';
import deleteConversationsForUserCommand from '../../../src/commands/deleteConversationsForUserCommand';

describe('deleteConversationsForUserAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete conversations successfully', async () => {
    vi.mocked(deleteConversationsForUserCommand).mockResolvedValue(undefined);

    await deleteConversationsForUserAction('user-id');

    expect(deleteConversationsForUserCommand).toHaveBeenCalledWith('user-id');
  });

  it('should handle errors from command', async () => {
    vi.mocked(deleteConversationsForUserCommand).mockRejectedValue(
      new Error('Database error')
    );

    await expect(deleteConversationsForUserAction('user-id')).rejects.toThrow(
      'Database error'
    );
  });
});
