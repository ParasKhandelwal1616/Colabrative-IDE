import { Server } from '@hocuspocus/server';

// Initialize the server directly using 'new'
const server = new Server({
  port: 1234,
  
  async onConnect(data) {
    console.log(`New user connected to document: ${data.documentName}`);
  },
});

// Start listening
server.listen().then(() => {
  console.log('🚀 Hocuspocus Collaboration Server running on port 1234');
});