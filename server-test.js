const http = require('http');
const server = http.createServer();
const io = require('socket.io')(server, { cors: { origin: "*" } });

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.on('number', (data) => {
    console.log('Received number:', data.number);
    const result = data.number * 2;
    // Emit result to all clients
    socket.emit('result', { result });
  });
});

server.listen(3000, () => {
  console.log('Server listening on port 3000');
});
