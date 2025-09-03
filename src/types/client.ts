import WebSocket from 'ws';

export interface Client {
  ws: WebSocket;
  id: string;
  username: string;
}