import { WorkflowConnection, WorkflowDefinition, WorkflowNode } from '@/types/workflow';

export interface CollaborationUser {
  id: string;
  name: string;
  color: string;
  cursorPosition?: { x: number; y: number };
  selectedNodeId?: string;
  lastActive: number;
  isOnline: boolean;
}

export interface CollaborationMessage {
  type: 'join' | 'leave' | 'cursor' | 'selection' | 'node_update' | 'connection_update' | 'sync' | 'chat';
  userId: string;
  userName: string;
  payload: unknown;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: number;
}

type MessageHandler = (message: CollaborationMessage) => void;

const COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', 
  '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'
];

const generateUserId = () => {
  const stored = localStorage.getItem('aemflow-user-id');
  if (stored) {return stored;}
  const id = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('aemflow-user-id', id);
  return id;
};

const generateUserName = () => {
  const adjectives = ['Happy', 'Swift', 'Bright', 'Cool', 'Bold', 'Keen', 'Quick', 'Sharp'];
  const nouns = ['Developer', 'Designer', 'Editor', 'Builder', 'Creator', 'Maker', 'Artist', 'Coder'];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}`;
};

const generateColor = () => COLORS[Math.floor(Math.random() * COLORS.length)];

class CollaborationService {
  private channel: BroadcastChannel | null = null;
  private userId: string;
  private userName: string;
  private userColor: string;
  private currentWorkflowId: string | null = null;
  private handlers: Set<MessageHandler> = new Set();
  private heartbeatInterval: number | null = null;
  private users: Map<string, CollaborationUser> = new Map();
  private onUsersUpdate: ((users: CollaborationUser[]) => void) | null = null;
  private onChatUpdate: ((messages: ChatMessage[]) => void) | null = null;
  private chatMessages: ChatMessage[] = [];

  constructor() {
    this.userId = generateUserId();
    this.userName = localStorage.getItem('aemflow-user-name') || generateUserName();
    this.userColor = generateColor();
    localStorage.setItem('aemflow-user-name', this.userName);
  }

  setOnUsersUpdate(callback: (users: CollaborationUser[]) => void) {
    this.onUsersUpdate = callback;
  }

  setOnChatUpdate(callback: (messages: ChatMessage[]) => void) {
    this.onChatUpdate = callback;
  }

  connect(workflowId: string) {
    if (this.channel) {
      this.disconnect();
    }

    this.currentWorkflowId = workflowId;
    this.channel = new BroadcastChannel(`aemflow-workflow-${workflowId}`);
    
    this.channel.onmessage = (event) => {
      this.handleMessage(event.data);
    };

    this.broadcast({
      type: 'join',
      userId: this.userId,
      userName: this.userName,
      payload: { color: this.userColor },
      timestamp: Date.now()
    });

    this.startHeartbeat();
    this.notifyUsersUpdate();
  }

  disconnect() {
    if (this.currentWorkflowId) {
      this.broadcast({
        type: 'leave',
        userId: this.userId,
        userName: this.userName,
        payload: null,
        timestamp: Date.now()
      });
    }

    this.stopHeartbeat();
    
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }

    this.currentWorkflowId = null;
    this.users.clear();
    this.chatMessages = [];
    this.notifyUsersUpdate();
    this.notifyChatUpdate();
  }

  subscribe(handler: MessageHandler) {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  private broadcast(message: CollaborationMessage) {
    if (this.channel) {
      this.channel.postMessage(message);
    }
  }

  private handleMessage(message: CollaborationMessage) {
    if (message.userId === this.userId) {return;}

    switch (message.type) {
      case 'join':
        this.handleUserJoin(message);
        break;
      case 'leave':
        this.handleUserLeave(message);
        break;
      case 'cursor':
        this.handleCursorUpdate(message);
        break;
      case 'selection':
        this.handleSelectionUpdate(message);
        break;
      case 'sync':
        this.handleSync(message);
        break;
      case 'chat':
        this.handleChatMessage(message);
        break;
      default:
        this.handlers.forEach(handler => handler(message));
    }
  }

  private handleUserJoin(message: CollaborationMessage) {
    const payload = message.payload as { color: string };
    const user: CollaborationUser = {
      id: message.userId,
      userName: message.userName,
      color: payload?.color || generateColor(),
      lastActive: message.timestamp,
      isOnline: true
    };
    this.users.set(message.userId, user);
    this.notifyUsersUpdate();
  }

  private handleUserLeave(message: CollaborationMessage) {
    this.users.delete(message.userId);
    this.notifyUsersUpdate();
  }

  private handleCursorUpdate(message: CollaborationMessage) {
    const user = this.users.get(message.userId);
    if (user) {
      user.cursorPosition = message.payload as { x: number; y: number };
      user.lastActive = message.timestamp;
      this.notifyUsersUpdate();
    }
  }

  private handleSelectionUpdate(message: CollaborationMessage) {
    const user = this.users.get(message.userId);
    if (user) {
      user.selectedNodeId = message.payload as string;
      user.lastActive = message.timestamp;
      this.notifyUsersUpdate();
    }
  }

  private handleSync(message: CollaborationMessage) {
    this.handlers.forEach(handler => handler(message));
  }

  private handleChatMessage(message: CollaborationMessage) {
    const chatMsg = message.payload as ChatMessage;
    this.chatMessages.push(chatMsg);
    this.notifyChatUpdate();
  }

  private notifyUsersUpdate() {
    if (this.onUsersUpdate) {
      this.onUsersUpdate(Array.from(this.users.values()));
    }
  }

  private notifyChatUpdate() {
    if (this.onChatUpdate) {
      this.onChatUpdate([...this.chatMessages]);
    }
  }

  private startHeartbeat() {
    this.heartbeatInterval = window.setInterval(() => {
      this.users.forEach((user, id) => {
        if (Date.now() - user.lastActive > 10000 && id !== this.userId) {
          this.users.delete(id);
        }
      });
      this.notifyUsersUpdate();
    }, 5000);
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  sendCursorPosition(x: number, y: number) {
    this.broadcast({
      type: 'cursor',
      userId: this.userId,
      userName: this.userName,
      payload: { x, y },
      timestamp: Date.now()
    });
  }

  sendSelection(nodeId: string | null) {
    this.broadcast({
      type: 'selection',
      userId: this.userId,
      userName: this.userName,
      payload: nodeId || '',
      timestamp: Date.now()
    });
  }

  sendWorkflowUpdate(workflow: WorkflowDefinition) {
    this.broadcast({
      type: 'sync',
      userId: this.userId,
      userName: this.userName,
      payload: workflow,
      timestamp: Date.now()
    });
  }

  sendChatMessage(message: string) {
    const chatMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      userId: this.userId,
      userName: this.userName,
      message,
      timestamp: Date.now()
    };

    this.chatMessages.push(chatMsg);
    this.broadcast({
      type: 'chat',
      userId: this.userId,
      userName: this.userName,
      payload: chatMsg,
      timestamp: Date.now()
    });
    this.notifyChatUpdate();
  }

  getCurrentUser() {
    return {
      id: this.userId,
      name: this.userName,
      color: this.userColor
    };
  }

  getUsers() {
    return Array.from(this.users.values());
  }

  getChatMessages() {
    return [...this.chatMessages];
  }

  isConnected() {
    return this.channel !== null;
  }

  setUserName(name: string) {
    this.userName = name;
    localStorage.setItem('aemflow-user-name', name);
  }
}

export const collaborationService = new CollaborationService();
