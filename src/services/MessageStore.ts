import type { ChatMessage } from '../types/messages.ts';

export class MessageStore {
  private messages: ChatMessage[] = [];
  private readonly maxHistory: number;

  constructor(maxHistory: number = 100) {
    this.maxHistory = maxHistory;
  }

  addMessage(message: ChatMessage): void {
    this.messages.push(message);
    if (this.messages.length > this.maxHistory) {
      this.messages.shift();
    }
  }

  getMessages(): ChatMessage[] {
    return [...this.messages];
  }

  clear(): void {
    this.messages = [];
  }

  getMessageCount(): number {
    return this.messages.length;
  }
}