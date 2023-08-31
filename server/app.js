import express from 'express';
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import webhookController from './controllers/webhookController.js';
import http from 'http';
import {Server} from 'socket.io'

dotenv.config();
const app = express()
const PORT = process.env.PORT || 5000;
const server = http.createServer(app); // Create an http server
const io = new Server(server, {
  cors: {
    origin: '*',
    credentials: true
  }

});


app.use(cors());  
app.use(bodyParser.json());

app.get('/', (req, res) => res.send('Hello World!'));

app.use('/api', webhookController);



io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.on("message", (isOpen, showQuant, data) => {
    io.emit("message", isOpen, showQuant, data);
  });
});



server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });



