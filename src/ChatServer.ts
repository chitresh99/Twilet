import { ClientManager } from './services/ClientManager.ts';
import { MessageStore } from './services/MessageStore.ts';
import { MessageHandler } from './services/MessageHandler.ts';
import { WebSocketManager } from './services/WebSocketManager.ts';

export class ChatServer {
  private clientManager: ClientManager;
  private messageStore: MessageStore;
  private messageHandler: MessageHandler;
  private webSocketManager: WebSocketManager;

  constructor(port: number = 8080, maxHistory: number = 100) {
    this.clientManager = new ClientManager();
    this.messageStore = new MessageStore(maxHistory);
    
    // Create message handler with broadcaster callback
    this.messageHandler = new MessageHandler(
      this.clientManager,
      this.messageStore,
      (message, excludeClientId) => this.webSocketManager.broadcast(message, excludeClientId)
    );

    this.webSocketManager = new WebSocketManager(
      port,
      this.clientManager,
      this.messageHandler
    );
  }

  // Utility methods
  getConnectedUsers(): string[] {
    return this.clientManager.getUsernames();
  }

  getConnectionCount(): number {
    return this.clientManager.getClientCount();
  }

  getMessageCount(): number {
    return this.messageStore.getMessageCount();
  }

  stop(): void {
    this.webSocketManager.stop();
    this.clientManager.clear();
    this.messageStore.clear();
    console.log('Chat server stopped');
  }
}