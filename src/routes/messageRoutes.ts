import { Router, type Request, type Response } from 'express';
import isAuthorized from '../validators/requests/isAuthorized';
import getErrorResponseJson from '../utils/getErrorResponseJson';
import { createConversationValidator } from '../validators/requests/createConversationValidator';
import { sendMessageValidator } from '../validators/requests/sendMessageValidator';
import { paginationValidator } from '../validators/requests/paginationValidator';
import { conversationIdValidator } from '../validators/requests/conversationIdValidator';
import userIdValidator from '../validators/requests/userIdValidator';
import { typingStatusValidator } from '../validators/requests/typingStatusValidator';
import { createConversationAction } from '../actions/createConversationAction';
import { sendMessageAction } from '../actions/sendMessageAction';
import { getConversationsAction } from '../actions/getConversationsAction';
import { getMessagesAction } from '../actions/getMessagesAction';
import { markAsReadAction } from '../actions/markAsReadAction';
import { setTypingStatusAction } from '../actions/setTypingStatusAction';
import { getUnreadMessagesCountAction } from '../actions/getUnreadMessagesCountAction';
import { deleteConversationsForUserAction } from '../actions/deleteConversationsForUserAction';
import { deleteConversationAction } from '../actions/deleteConversationAction';

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       description: JWT access token obtained from Supabase authentication
 *     RefreshToken:
 *       type: apiKey
 *       in: header
 *       name: refresh-token
 *       description: Refresh token for maintaining authentication session
 *   schemas:
 *     Conversation:
 *       type: object
 *       properties:
 *         conversationId:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the conversation
 *         adopterId:
 *           type: string
 *           format: uuid
 *           description: User ID of the adopter in this conversation
 *         rehomerId:
 *           type: string
 *           format: uuid
 *           description: User ID of the rehomer in this conversation
 *         animalId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: Animal ID associated with this conversation (optional)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the conversation was created
 *         lastMessageAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Timestamp of the last message in this conversation
 *         adopterLastActiveAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Last activity timestamp for the adopter
 *         rehomerLastActiveAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Last activity timestamp for the rehomer
 *         adopterLastReadAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Last read timestamp for the adopter
 *         rehomerLastReadAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Last read timestamp for the rehomer
 *         otherUserName:
 *           type: string
 *           nullable: true
 *           description: Name of the other participant in the conversation
 *         otherUserProfilePicture:
 *           type: string
 *           nullable: true
 *           description: Profile picture URL of the other participant
 *         unreadCount:
 *           type: integer
 *           minimum: 0
 *           description: Number of unread messages for the requesting user
 *         animalName:
 *           type: string
 *           nullable: true
 *           description: Name of the animal associated with this conversation
 *         animalPhoto:
 *           type: string
 *           nullable: true
 *           description: Photo URL of the animal associated with this conversation
 *     Message:
 *       type: object
 *       properties:
 *         messageId:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the message
 *         conversationId:
 *           type: string
 *           format: uuid
 *           description: ID of the conversation this message belongs to
 *         senderId:
 *           type: string
 *           format: uuid
 *           description: User ID of the message sender
 *         content:
 *           type: string
 *           description: Text content of the message
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the message was sent
 *         isRead:
 *           type: boolean
 *           description: Whether the message has been read by the recipient
 *         readAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Timestamp when the message was read
 *     PaginationMetadata:
 *       type: object
 *       properties:
 *         totalResults:
 *           type: integer
 *           minimum: 0
 *           description: Total number of results available
 *         page:
 *           type: integer
 *           minimum: 1
 *           description: Current page number (1-indexed)
 *         pageSize:
 *           type: integer
 *           minimum: 1
 *           description: Number of items per page
 *         totalPages:
 *           type: integer
 *           minimum: 0
 *           description: Total number of pages available
 *     Error:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message describing what went wrong
 *     CreateConversationRequest:
 *       type: object
 *       required:
 *         - rehomerId
 *       properties:
 *         rehomerId:
 *           type: string
 *           format: uuid
 *           description: User ID of the rehomer to start a conversation with
 *         animalId:
 *           type: string
 *           format: uuid
 *           description: Optional animal ID to associate with the conversation
 *     SendMessageRequest:
 *       type: object
 *       required:
 *         - content
 *       properties:
 *         content:
 *           type: string
 *           minLength: 1
 *           maxLength: 5000
 *           description: Text content of the message (1-5000 characters)
 *     TypingStatusRequest:
 *       type: object
 *       required:
 *         - isTyping
 *       properties:
 *         isTyping:
 *           type: boolean
 *           description: Whether the user is currently typing
 */

const router = Router();

/**
 * @swagger
 * /api/messages/{userId}/conversations:
 *   post:
 *     summary: Create a new conversation
 *     description: Creates a new conversation between an adopter (the authenticated user) and a rehomer. The userId in the path must match the authenticated user's ID. Optionally associates the conversation with a specific animal.
 *     tags:
 *       - Conversations
 *     security:
 *       - BearerAuth: []
 *       - RefreshToken: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID of the adopter creating the conversation (must match authenticated user)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateConversationRequest'
 *           examples:
 *             withAnimal:
 *               summary: Conversation about a specific animal
 *               value:
 *                 rehomerId: "123e4567-e89b-12d3-a456-426614174000"
 *                 animalId: "987e6543-e21c-12d3-a456-426614174999"
 *             withoutAnimal:
 *               summary: General conversation
 *               value:
 *                 rehomerId: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       201:
 *         description: Conversation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversation:
 *                   $ref: '#/components/schemas/Conversation'
 *       400:
 *         description: Invalid request data (e.g., invalid UUID format)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Missing or invalid authentication credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Conflict - Conversation already exists between these users
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/:userId/conversations',
  isAuthorized,
  userIdValidator,
  createConversationValidator,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { rehomerId, animalId } = req.body;
      const result = await createConversationAction(
        userId as string,
        rehomerId,
        animalId
      );
      return res.status(201).json(result);
    } catch (error) {
      return getErrorResponseJson(error, res);
    }
  }
);

/**
 * @swagger
 * /api/messages/{userId}/conversations/{conversationId}/messages:
 *   post:
 *     summary: Send a message in a conversation
 *     description: Sends a new message in an existing conversation. The user must be a participant (adopter or rehomer) in the conversation to send messages.
 *     tags:
 *       - Messages
 *     security:
 *       - BearerAuth: []
 *       - RefreshToken: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID of the message sender (must match authenticated user)
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the conversation to send the message in
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SendMessageRequest'
 *           example:
 *             content: "Hello! I'm interested in adopting this cat. Is it still available?"
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   $ref: '#/components/schemas/Message'
 *       400:
 *         description: Invalid request data (e.g., message too long, invalid UUID)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Missing or invalid authentication credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - User is not a participant in this conversation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Conversation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/:userId/conversations/:conversationId/messages',
  isAuthorized,
  conversationIdValidator,
  userIdValidator,
  sendMessageValidator,
  async (req: Request, res: Response) => {
    try {
      const { conversationId, userId } = req.params;
      const result = await sendMessageAction(
        conversationId as string,
        userId as string,
        req.body.content
      );
      return res.status(201).json(result);
    } catch (error) {
      return getErrorResponseJson(error, res);
    }
  }
);

/**
 * @swagger
 * /api/messages/{userId}/conversations:
 *   get:
 *     summary: Get user's conversations
 *     description: Retrieves a paginated list of all conversations for the authenticated user, including metadata about unread messages, last activity, and the other participant's information.
 *     tags:
 *       - Conversations
 *     security:
 *       - BearerAuth: []
 *       - RefreshToken: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID to retrieve conversations for (must match authenticated user)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination (1-indexed)
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of conversations per page
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 conversations:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Conversation'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMetadata'
 *             example:
 *               conversations:
 *                 - conversationId: "123e4567-e89b-12d3-a456-426614174000"
 *                   adopterId: "456e7890-e89b-12d3-a456-426614174111"
 *                   rehomerId: "789e0123-e89b-12d3-a456-426614174222"
 *                   animalId: "987e6543-e21c-12d3-a456-426614174999"
 *                   createdAt: "2026-06-01T10:30:00Z"
 *                   lastMessageAt: "2026-06-02T09:15:00Z"
 *                   unreadCount: 3
 *                   otherUserName: "John Doe"
 *                   animalName: "Whiskers"
 *               pagination:
 *                 totalResults: 15
 *                 page: 1
 *                 pageSize: 20
 *                 totalPages: 1
 *       400:
 *         description: Invalid request parameters (e.g., invalid userId, page, or pageSize)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Missing or invalid authentication credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:userId/conversations',
  isAuthorized,
  userIdValidator,
  paginationValidator,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { page, pageSize } = req.pagination || { page: 1, pageSize: 20 };
      const result = await getConversationsAction(
        userId as string,
        page,
        pageSize
      );
      return res.status(200).json(result);
    } catch (error) {
      return getErrorResponseJson(error, res);
    }
  }
);

/**
 * @swagger
 * /api/messages/{userId}/conversations/{conversationId}/messages:
 *   get:
 *     summary: Get messages in a conversation
 *     description: Retrieves a paginated list of messages for a specific conversation. The user must be a participant in the conversation to access the messages.
 *     tags:
 *       - Messages
 *     security:
 *       - BearerAuth: []
 *       - RefreshToken: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID requesting the messages (must match authenticated user)
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the conversation to retrieve messages from
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination (1-indexed)
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of messages per page
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 messages:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Message'
 *                 pagination:
 *                   $ref: '#/components/schemas/PaginationMetadata'
 *             example:
 *               messages:
 *                 - messageId: "111e2222-e89b-12d3-a456-426614174333"
 *                   conversationId: "123e4567-e89b-12d3-a456-426614174000"
 *                   senderId: "456e7890-e89b-12d3-a456-426614174111"
 *                   content: "Hello! Is the cat still available?"
 *                   createdAt: "2026-06-02T09:00:00Z"
 *                   isRead: true
 *                   readAt: "2026-06-02T09:15:00Z"
 *               pagination:
 *                 totalResults: 42
 *                 page: 1
 *                 pageSize: 20
 *                 totalPages: 3
 *       400:
 *         description: Invalid request parameters (e.g., invalid UUID, page, or pageSize)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Missing or invalid authentication credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - User is not a participant in this conversation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Conversation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:userId/conversations/:conversationId/messages',
  isAuthorized,
  conversationIdValidator,
  userIdValidator,
  paginationValidator,
  async (req: Request, res: Response) => {
    try {
      const { conversationId, userId } = req.params;
      const { page, pageSize } = req.pagination || { page: 1, pageSize: 20 };
      const result = await getMessagesAction(
        conversationId as string,
        userId as string,
        page,
        pageSize
      );
      return res.status(200).json(result);
    } catch (error) {
      return getErrorResponseJson(error, res);
    }
  }
);

/**
 * @swagger
 * /api/messages/{userId}/conversations/{conversationId}/read:
 *   put:
 *     summary: Mark messages as read
 *     description: Marks all unread messages in a conversation as read for the authenticated user. Updates the user's last read timestamp for the conversation.
 *     tags:
 *       - Messages
 *     security:
 *       - BearerAuth: []
 *       - RefreshToken: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID marking messages as read (must match authenticated user)
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the conversation to mark messages as read
 *     responses:
 *       200:
 *         description: Messages marked as read successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updatedCount:
 *                   type: integer
 *                   minimum: 0
 *                   description: Number of messages that were marked as read
 *             example:
 *               updatedCount: 5
 *       400:
 *         description: Invalid request parameters (e.g., invalid UUID format)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Missing or invalid authentication credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - User is not a participant in this conversation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Conversation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/:userId/conversations/:conversationId/read',
  isAuthorized,
  conversationIdValidator,
  userIdValidator,
  async (req: Request, res: Response) => {
    try {
      const { conversationId, userId } = req.params;
      const result = await markAsReadAction(
        conversationId as string,
        userId as string
      );
      return res.status(200).json(result);
    } catch (error) {
      return getErrorResponseJson(error, res);
    }
  }
);

/**
 * @swagger
 * /api/messages/{userId}/conversations/{conversationId}/typing:
 *   put:
 *     summary: Set typing status
 *     description: Updates the typing status for a user in a conversation. This allows real-time indication to other participants that the user is currently typing a message.
 *     tags:
 *       - Conversations
 *     security:
 *       - BearerAuth: []
 *       - RefreshToken: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID setting typing status (must match authenticated user)
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the conversation where typing status is being set
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TypingStatusRequest'
 *           examples:
 *             startTyping:
 *               summary: User starts typing
 *               value:
 *                 isTyping: true
 *             stopTyping:
 *               summary: User stops typing
 *               value:
 *                 isTyping: false
 *     responses:
 *       200:
 *         description: Typing status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the operation was successful
 *             example:
 *               success: true
 *       400:
 *         description: Invalid request data (e.g., isTyping is not a boolean)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Missing or invalid authentication credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - User is not a participant in this conversation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Conversation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/:userId/conversations/:conversationId/typing',
  isAuthorized,
  conversationIdValidator,
  userIdValidator,
  typingStatusValidator,
  async (req: Request, res: Response) => {
    try {
      const { conversationId, userId } = req.params;
      const result = await setTypingStatusAction(
        conversationId as string,
        userId as string,
        req.body.isTyping
      );
      return res.status(200).json(result);
    } catch (error) {
      return getErrorResponseJson(error, res);
    }
  }
);

/**
 * @swagger
 * /api/messages/{userId}/unread-count:
 *   get:
 *     summary: Get total unread messages count
 *     description: Retrieves the total count of unread messages across all conversations for the authenticated user. Useful for displaying notification badges.
 *     tags:
 *       - Messages
 *     security:
 *       - BearerAuth: []
 *       - RefreshToken: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID to get unread count for (must match authenticated user)
 *     responses:
 *       200:
 *         description: Unread count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 unreadCount:
 *                   type: integer
 *                   minimum: 0
 *                   description: Total number of unread messages across all conversations
 *             example:
 *               unreadCount: 12
 *       400:
 *         description: Invalid userId parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Missing or invalid authentication credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:userId/unread-count',
  isAuthorized,
  userIdValidator,
  async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const result = await getUnreadMessagesCountAction(userId as string);
      return res.status(200).json(result);
    } catch (error) {
      return getErrorResponseJson(error, res);
    }
  }
);

/**
 * @swagger
 * /api/messages/{userId}/conversations/{conversationId}:
 *   delete:
 *     summary: Delete a conversation (WhatsApp-style)
 *     description: Soft deletes a conversation for the authenticated user. The conversation will disappear from their UI but remain visible to the other participant. If both users delete the conversation, it will be permanently removed from the database along with all messages (cascade delete).
 *     tags:
 *       - Conversations
 *     security:
 *       - BearerAuth: []
 *       - RefreshToken: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID deleting the conversation (must match authenticated user)
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the conversation to delete
 *     responses:
 *       200:
 *         description: Conversation deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   description: Indicates whether the operation was successful
 *                 hardDeleted:
 *                   type: boolean
 *                   description: True if conversation was permanently deleted (both users deleted), false if soft deleted for this user only
 *             examples:
 *               softDelete:
 *                 summary: Soft deleted for one user
 *                 value:
 *                   success: true
 *                   hardDeleted: false
 *               hardDelete:
 *                 summary: Permanently deleted
 *                 value:
 *                   success: true
 *                   hardDeleted: true
 *       400:
 *         description: Invalid request parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Missing or invalid authentication credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - User is not a participant in this conversation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Conversation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  '/:userId/conversations/:conversationId',
  isAuthorized,
  conversationIdValidator,
  userIdValidator,
  async (req: Request, res: Response) => {
    try {
      const { conversationId, userId } = req.params;
      const result = await deleteConversationAction(
        conversationId as string,
        userId as string
      );
      return res.status(200).json(result);
    } catch (error) {
      return getErrorResponseJson(error, res);
    }
  }
);

/**
 * @swagger
 * /api/messages/{userId}/conversations:
 *   delete:
 *     summary: Delete all conversations for a user
 *     description: Permanently deletes all conversations and associated messages for the specified user. This is typically used when a user account is being deleted. This operation cannot be undone.
 *     tags:
 *       - Conversations
 *     security:
 *       - BearerAuth: []
 *       - RefreshToken: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID whose conversations should be deleted (must match authenticated user)
 *     responses:
 *       200:
 *         description: All conversations deleted successfully (no content returned)
 *       400:
 *         description: Invalid userId parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Missing or invalid authentication credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  '/:userId/conversations',
  isAuthorized,
  userIdValidator,
  async (req: Request, res: Response) => {
    try {
      await deleteConversationsForUserAction(req.params.userId as string);
    } catch (error) {
      return getErrorResponseJson(error, res);
    }
  }
);

export default router;
