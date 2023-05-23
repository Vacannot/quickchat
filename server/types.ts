export interface Message {
  body: string;
  from: string;
}

export interface ServerToClientEvents {
  message: (message: Message) => void;
  connected: (username: string) => void;
  roomList: (rooms: string[]) => void;
  joined: (room: string) => void;
  _error: (errorMessage: string) => void;
  userList: (users: string[]) => void;
  isTyping: (username: string) => void;
  left: (room: string) => void;
}

export interface ClientToServerEvents {
  message: (message: string, to: string) => void;
  join: (room: string) => void;
  typing: (room: string) => void;
  leave: (room: string) => void;
}

export interface ServerSocketData {
  username: string;
  chatlog: (chatlog: string[]) => void;
}
