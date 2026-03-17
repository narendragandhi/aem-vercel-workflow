import React, { useEffect, useState } from 'react';
import { MousePointer2 } from 'lucide-react';
import { collaborationService, CollaborationUser } from '@/services/collaborationService';

interface CollaborationCursorsProps {
  users: CollaborationUser[];
  currentUserId: string;
}

export const CollaborationCursors: React.FC<CollaborationCursorsProps> = ({
  users,
  currentUserId
}) => {
  return (
    <>
      {users
        .filter((user) => user.id !== currentUserId && user.cursorPosition)
        .map((user) => (
          <div
            key={user.id}
            className="fixed pointer-events-none z-40 transition-all duration-100"
            style={{
              left: user.cursorPosition!.x,
              top: user.cursorPosition!.y,
              transform: 'translate(-2px, -2px)'
            }}
          >
            <MousePointer2
              className="w-4 h-4"
              style={{ color: user.color }}
              fill={user.color}
            />
            <div
              className="absolute left-4 top-2 px-2 py-0.5 rounded text-xs text-white whitespace-nowrap"
              style={{ backgroundColor: user.color }}
            >
              {user.userName}
            </div>
          </div>
        ))}
    </>
  );
};

export const useCollaborationUsers = () => {
  const [users, setUsers] = useState<CollaborationUser[]>([]);

  useEffect(() => {
    collaborationService.setOnUsersUpdate((updatedUsers) => {
      setUsers(updatedUsers);
    });

    return () => {
      collaborationService.setOnUsersUpdate(() => {});
    };
  }, []);

  return users;
};
