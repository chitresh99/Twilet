import { ChatServer } from './ChatServer.ts';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;
const chatServer = new ChatServer(PORT);

process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  chatServer.stop();
  process.exit(0);
});

export default ChatServer;