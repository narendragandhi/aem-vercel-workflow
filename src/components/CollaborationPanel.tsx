import React, { useEffect, useRef, useState } from 'react';
import { Circle, MessageSquare, Send, Users, Wifi, WifiOff, X } from 'lucide-react';
import { ChatMessage, collaborationService, CollaborationUser } from '@/services/collaborationService';

interface CollaborationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({ isOpen, onClose }) => {
  const [users, setUsers] = useState<CollaborationUser[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [userName, setUserName] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentUser = collaborationService.getCurrentUser();

  useEffect(() => {
    collaborationService.setOnUsersUpdate((updatedUsers) => {
      setUsers(updatedUsers);
    });

    collaborationService.setOnChatUpdate((messages) => {
      setChatMessages(messages);
    });

    setIsConnected(collaborationService.isConnected());
    setUserName(currentUser.name);

    return () => {
      collaborationService.setOnUsersUpdate(() => {});
      collaborationService.setOnChatUpdate(() => {});
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      collaborationService.sendChatMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNameChange = () => {
    if (userName.trim()) {
      collaborationService.setUserName(userName.trim());
    }
    setEditingName(false);
  };

  if (!isOpen) {return null;}

  return (
    <div className="fixed right-4 top-20 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col max-h-[70vh]">
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          <span className="font-medium text-sm text-gray-900 dark:text-white">Collaboration</span>
          {isConnected ? (
            <Wifi className="w-4 h-4 text-green-500" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-500" />
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: currentUser.color }}
          />
          {editingName ? (
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onBlur={handleNameChange}
              onKeyPress={(e) => e.key === 'Enter' && handleNameChange()}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              autoFocus
            />
          ) : (
            <span
              className="flex-1 text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-500"
              onClick={() => setEditingName(true)}
            >
              {currentUser.name} (You)
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {users.length} other{users.length !== 1 ? 's' : ''} online
        </div>
      </div>

      {users.length > 0 && (
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            Active Collaborators
          </div>
          <div className="flex flex-wrap gap-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700"
                title={`${user.userName}${user.selectedNodeId ? ` - editing node` : ''}`}
              >
                <Circle
                  className="w-2 h-2 fill-current"
                  style={{ color: user.color }}
                />
                <span className="text-xs text-gray-700 dark:text-gray-300">
                  {user.userName}
                </span>
                {user.selectedNodeId && (
                  <MessageSquare className="w-3 h-3 text-blue-500" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 min-h-[150px] max-h-[250px]">
        {chatMessages.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-4">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-2">
            {chatMessages.map((msg) => {
              const isOwn = msg.userId === currentUser.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                >
                  <div className="text-xs text-gray-500 mb-1">
                    {isOwn ? 'You' : msg.userName}
                  </div>
                  <div
                    className={`px-3 py-2 rounded-lg max-w-[85%] ${
                      isOwn
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p className="text-sm break-words">{msg.message}</p>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
