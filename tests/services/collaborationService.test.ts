import { collaborationService, CollaborationUser, ChatMessage } from '../../src/services/collaborationService';

describe('CollaborationService', () => {
  beforeEach(() => {
    collaborationService.disconnect();
    localStorage.clear();
  });

  describe('User identity', () => {
    it('should generate a user ID', () => {
      const user = collaborationService.getCurrentUser();
      expect(user.id).toBeDefined();
      expect(user.id).toMatch(/^user-/);
    });

    it('should generate a user name', () => {
      const user = collaborationService.getCurrentUser();
      expect(user.name).toBeDefined();
      expect(user.name.length).toBeGreaterThan(0);
    });

    it('should generate a color', () => {
      const user = collaborationService.getCurrentUser();
      expect(user.color).toMatch(/^#[0-9a-f]{6}$/i);
    });

    it('should allow setting custom user name', () => {
      collaborationService.setUserName('TestUser');
      expect(collaborationService.getCurrentUser().name).toBe('TestUser');
    });
  });

  describe('Connection state', () => {
    it('should start disconnected', () => {
      expect(collaborationService.isConnected()).toBe(false);
    });

    it('should connect to a workflow', () => {
      collaborationService.connect('test-workflow');
      expect(collaborationService.isConnected()).toBe(true);
    });

    it('should disconnect from a workflow', () => {
      collaborationService.connect('test-workflow');
      collaborationService.disconnect();
      expect(collaborationService.isConnected()).toBe(false);
    });
  });

  describe('Chat messaging', () => {
    it('should start with empty chat messages', () => {
      expect(collaborationService.getChatMessages()).toEqual([]);
    });

    it('should send a chat message', () => {
      const callback = jest.fn();
      collaborationService.setOnChatUpdate(callback);
      collaborationService.sendChatMessage('Hello, world!');
      
      const messages = collaborationService.getChatMessages();
      expect(messages).toHaveLength(1);
      expect(messages[0].message).toBe('Hello, world!');
    });
  });

  describe('User management', () => {
    it('should start with no other users', () => {
      expect(collaborationService.getUsers()).toEqual([]);
    });
  });
});
