import type { Client } from '../types/client.js';

export class ClientManager {
  private clients: Map<string, Client> = new Map();

  addClient(client: Client): void {
    this.clients.set(client.id, client);
  }

  removeClient(clientId: string): Client | undefined {
    const client = this.clients.get(clientId);
    this.clients.delete(clientId);
    return client;
  }

  getClient(clientId: string): Client | undefined {
    return this.clients.get(clientId);
  }

  getAllClients(): Client[] {
    return Array.from(this.clients.values());
  }

  getUsernames(): string[] {
    return this.getAllClients().map(client => client.username);
  }

  isUsernameTaken(username: string): boolean {
    return this.getAllClients().some(
      client => client.username.toLowerCase() === username.toLowerCase()
    );
  }

  getClientCount(): number {
    return this.clients.size;
  }

  clear(): void {
    this.clients.clear();
  }
}