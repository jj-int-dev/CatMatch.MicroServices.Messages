// Mock the command
vi.mock('../../../src/commands/createConversationCommand', () => ({
  createConversationCommand: vi.fn()
}));

// Mock the user role validator
vi.mock('../../../src/validators/userRoleValidator', () => ({
  validateConversationParticipants: vi.fn()
}));

import { createConversationAction } from '../../../src/actions/createConversationAction';
import { createConversationCommand } from '../../../src/commands/createConversationCommand';
import { validateConversationParticipants } from '../../../src/validators/userRoleValidator';
import HttpResponseError from '../../../src/dtos/httpResponseError';

describe('createConversationAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock successful validation by default
    vi.mocked(validateConversationParticipants).mockResolvedValue({
      valid: true
    });
  });

  it('should create conversation successfully', async () => {
    const adopterId = 'adopter-id';
    const rehomerId = 'rehomer-id';
    const animalId = 'animal-id';

    const mockConversation = {
      conversationId: 'conv-id',
      adopterId,
      rehomerId,
      animalId,
      createdAt: '2026-06-01T10:00:00.000Z',
      lastMessageAt: null,
      adopterLastActiveAt: '2026-06-01T10:00:00.000Z',
      rehomerLastActiveAt: '2026-06-01T10:00:00.000Z',
      adopterLastReadAt: null,
      rehomerLastReadAt: null,
      adopterIsTyping: false,
      rehomerIsTyping: false,
      adopterLastTypingAt: null,
      rehomerLastTypingAt: null,
      otherUserName: null,
      otherUserProfilePicture: null,
      unreadCount: 0,
      animalName: null,
      animalPhoto: null
    };

    vi.mocked(createConversationCommand).mockResolvedValue({
      success: true,
      data: mockConversation
    });

    const result = await createConversationAction(
      adopterId,
      rehomerId,
      animalId
    );

    expect(result.conversation).toEqual(mockConversation);
    expect(createConversationCommand).toHaveBeenCalledWith(
      adopterId,
      rehomerId,
      animalId
    );
  });

  it('should throw 409 error when conversation already exists', async () => {
    vi.mocked(createConversationCommand).mockResolvedValue({
      success: false,
      errorMsg: 'Conversation already exists'
    });

    await expect(
      createConversationAction('adopter-id', 'rehomer-id')
    ).rejects.toThrow(HttpResponseError);

    try {
      await createConversationAction('adopter-id', 'rehomer-id');
    } catch (error) {
      expect((error as HttpResponseError).statusCode).toBe(409);
    }
  });

  it('should throw 500 error for other failures', async () => {
    vi.mocked(createConversationCommand).mockResolvedValue({
      success: false,
      errorMsg: 'Database connection failed'
    });

    await expect(
      createConversationAction('adopter-id', 'rehomer-id')
    ).rejects.toThrow(HttpResponseError);

    try {
      await createConversationAction('adopter-id', 'rehomer-id');
    } catch (error) {
      expect((error as HttpResponseError).statusCode).toBe(500);
    }
  });
});
