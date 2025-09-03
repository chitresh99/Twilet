import WebSocket, { WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import { v4 as uuidv4 } from 'uuid';
import type { Message } from '../types/messages.ts';
import { ClientManager } from './ClientManager.ts';
import { MessageHandler } from './MessageHandler.ts';

export class WebSocketManager {
  private wss: WebSocketServer;

  constructor(
    port: number,
    private clientManager: ClientManager,
    private messageHandler: MessageHandler
  ) {
    this.wss = new WebSocketServer({ port });
    this.setupServer();
    console.log(`WebSocket chat server running on port ${port}`);
  }

  private setupServer(): void {
    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      console.log('New client connected');
      this.handleConnection(ws, req);
    });
  }

  private handleConnection(ws: WebSocket, req: IncomingMessage): void {
    const clientId = uuidv4();

    // Handle incoming messages
    ws.on('message', (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(clientId, ws, message);
      } catch (error) {
        console.error('Error parsing message:', error);
        this.sendError(ws, 'Invalid message format');
      }
    });

    // Handle client disconnect
    ws.on('close', () => {
      const client = this.clientManager.getClient(clientId);
      console.log('Client disconnected:', client?.username || clientId);
      this.messageHandler.handleUserLeave(clientId);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Send welcome message and request username
    this.sendError(ws, 'Please send your username to join the chat');
  }

  private handleMessage(clientId: string, ws: WebSocket, message: any): void {
    const client = this.clientManager.getClient(clientId);

    // If client hasn't set username yet
    if (!client) {
      if (message.type === 'join' && message.username) {
        this.messageHandler.handleUserJoin(clientId, ws, message.username);
      } else {
        this.sendError(ws, 'Please provide a username first');
      }
      return;
    }

    // Handle different message types
    switch (message.type) {
      case 'message':
        this.messageHandler.handleChatMessage(client, message.content);
        break;
      case 'get_users':
        this.messageHandler.sendUserList(ws);
        break;
      case 'get_history':
        this.messageHandler.sendMessageHistory(ws);
        break;
      default:
        this.sendError(ws, 'Unknown message type');
    }
  }

  broadcast(message: Message, excludeClientId?: string): void {
    this.clientManager.getAllClients().forEach((client) => {
      if (client.id !== excludeClientId && client.ws.readyState === WebSocket.OPEN) {
        this.sendMessage(client.ws, message);
      }
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

  stop(): void {
    this.wss.close();
    console.log('WebSocket server stopped');
  }
}