export interface ChatMessage {
  type: 'message';
  id: string;
  username: string;
  content: string;
  timestamp: number;
}

export interface UserJoinMessage {
  type: 'user_join';
  username: string;
  timestamp: number;
}

export interface UserLeaveMessage {
  type: 'user_leave';
  username: string;
  timestamp: number;
}

export interface UserListMessage {
  type: 'user_list';
  users: string[];
}

export interface ErrorMessage {
  type: 'error';
  message: string;
}

export type Message = ChatMessage | UserJoinMessage | UserLeaveMessage | UserListMessage | ErrorMessage;