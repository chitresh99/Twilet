## **Using Postman for WebSocket Testing**

### Step 1: Create a WebSocket Request
1. Open Postman
2. Click "New" → "WebSocket Request"
3. Enter your WebSocket URL: `ws://localhost:8080`
4. Click "Connect"

### Step 2: Test the Connection Flow

#### 1. Connect and Join Chat
Once connected, you'll receive:
```json
{
  "type": "error",
  "message": "Please send your username to join the chat"
}
```

#### 2. Send Join Message
In the message box, send:
```json
{
  "type": "join",
  "username": "testuser123"
}
```

You should receive:
```json
{
  "type": "user_join",
  "username": "testuser123",
  "timestamp": 1756899902893
}
```

#### 3. Send a Chat Message
```json
{
  "type": "message",
  "content": "Hello from Postman!"
}
```

You should receive the broadcast:
```json
{
  "type": "message",
  "id": "some-uuid",
  "username": "testuser123",
  "content": "Hello from Postman!",
  "timestamp": 1756899957390
}
```

#### 4. Test Other Commands
Get user list:
```json
{
  "type": "get_users"
}
```

Get message history:
```json
{
  "type": "get_history"
}
```

## **Alternative: Using Browser Console**

If Postman doesn't work, open your browser's developer console and run:

```javascript
// Connect to your chat server
const ws = new WebSocket('ws://localhost:8080');

ws.onopen = function() {
    console.log('Connected!');
    
    // Join with username
    ws.send(JSON.stringify({
        type: 'join',
        username: 'browser_user'
    }));
};

ws.onmessage = function(event) {
    console.log('Received:', JSON.parse(event.data));
};

ws.onerror = function(error) {
    console.error('WebSocket error:', error);
};

// Send a message (run this after connecting)
ws.send(JSON.stringify({
    type: 'message',
    content: 'Hello from browser!'
}));

// Get users
ws.send(JSON.stringify({
    type: 'get_users'
}));

// Get history
ws.send(JSON.stringify({
    type: 'get_history'
}));
```

## **Testing Multiple Users**

To test multiple users:
1. Open multiple Postman WebSocket tabs
2. Connect each with different usernames
3. Send messages from one tab
4. Watch them appear in other tabs

## **Common Issues to Check:**

1. **Server Running?** Make sure your server is running on port 8080
2. **JSON Format** Ensure your messages are valid JSON
3. **Message Types** Use exact message types: `join`, `message`, `get_users`, `get_history`
4. **Username First** Always send the join message before other messages

## **Expected Test Flow:**
1. Connect → Receive welcome error message
2. Send join → Receive confirmation + any message history
3. Send message → Receive broadcast of your message
4. Send get_users → Receive user list
5. Send get_history → Receive all stored messages