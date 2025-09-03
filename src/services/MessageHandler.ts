import WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import type { Message, ChatMessage} from '../types/messages.ts';
import type { Client } from '../types/client.ts';
import { ClientManager } from './ClientManager.ts';
import { MessageStore } from './MessageStore.ts';

export class MessageHandler {
  constructor(
    private clientManager: ClientManager,
    private messageStore: MessageStore,
    private broadcaster: (message: Message, excludeClientId?: string) => void
  ) {}

  handleUserJoin(clientId: string, ws: WebSocket, username: string): void {
    // Check if username is already taken
    if (this.clientManager.isUsernameTaken(username)) {
      this.sendError(ws, 'Username already taken');
      return;
    }

    // Add client to the clients map
    const client: Client = {
      ws,
      id: clientId,
      username: username.trim()
    };

    this.clientManager.addClient(client);

    console.log(`User joined: ${username}`);

    // Send join confirmation to the user
    this.sendMessage(ws, {
      type: 'user_join',
      username,
      timestamp: Date.now()
    });

    // Send message history to the new user
    this.sendMessageHistory(ws);

    // Notify all users about the new user
    this.broadcaster({
      type: 'user_join',
      username,
      timestamp: Date.now()
    }, clientId);

    // Send updated user list to all clients
    this.broadcastUserList();
  }

  handleChatMessage(client: Client, content: string): void {
    if (!content || content.trim().length === 0) {
      this.sendError(client.ws, 'Message cannot be empty');
      return;
    }

    const message: ChatMessage = {
      type: 'message',
      id: uuidv4(),
      username: client.username,
      content: content.trim(),
      timestamp: Date.now()
    };

    // Add to message history
    this.messageStore.addMessage(message);

    // Broadcast message to all clients
    this.broadcaster(message);

    console.log(`Message from ${client.username}: ${content}`);
  }

  handleUserLeave(clientId: string): void {
    const client = this.clientManager.removeClient(clientId);
    if (!client) return;

    const username = client.username;

    // Notify all remaining users
    this.broadcaster({
      type: 'user_leave',
      username,
      timestamp: Date.now()
    });

    // Send updated user list
    this.broadcastUserList();
  }

  sendUserList(ws: WebSocket): void {
    const users = this.clientManager.getUsernames();
    this.sendMessage(ws, {
      type: 'user_list',
      users
    });
  }

  sendMessageHistory(ws: WebSocket): void {
    this.messageStore.getMessages().forEach(message => {
      this.sendMessage(ws, message);
    });
  }

  private sendMessage(ws: WebSocket, message: Message): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private sendError(ws: WebSocket, errorMessage: string): void {
    this.sendMessage(ws, {
      type: 'error',
      message: errorMessage
    });
  }

  private broadcastUserList(): void {
    const users = this.clientManager.getUsernames();
    const message = {
      type: 'user_list' as const,
      users
    };
    this.broadcaster(message);
  }
}