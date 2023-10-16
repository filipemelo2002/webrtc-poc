import { Server, Socket } from "socket.io";
import { logger } from "./logger";
import {Server as HTTPServer, createServer} from 'node:http';

interface Room {
  users: string[];
  offer: RTCSessionDescription;
  name: string;
  owner: string;
}

interface CreateRoomEvent {
  roomName: string;
  offer: RTCSessionDescription;
}

interface JoinRoomEvent {
  roomName: string;
}

interface SendAnswerEvent {
  roomName: string;
  answer: RTCSessionDescription;
}

export class WebSocket {
  private io: Server;
  private rooms: Room[] = [];
  private httpServer: HTTPServer;

  constructor() {
    this.httpServer = createServer()
    this.io = new Server(this.httpServer, {
      cors: {
        origin: 'http://localhost:5173'
      }
    });
  }

  private handleConnection() {
    this.io.on("connection", (socket) => {
      logger.info(`new connection made ${socket.id}`);
      this.handleOnCreateRoom(socket);
      this.handleOnJoinRoom(socket);
      this.handleOnSendAnswer(socket);
    });
  }

  private handleOnCreateRoom(socket: Socket) {
    socket.on("create-room", (request: CreateRoomEvent) => {
      this.rooms.push({
        name: request.roomName,
        users: [],
        offer: request.offer,
        owner: socket.id,
      });

      logger.info(`new room created ${request.roomName}`);
      logger.info(this.rooms)
    });
  }

  private handleOnJoinRoom(socket: Socket) {
    socket.on("join-room", (request: JoinRoomEvent) => {
      const room = this.getRoom(request.roomName);

      room?.users.push(socket.id);

      logger.info(`user ${socket.id} is joining room ${room?.name}`);
      this.io.to(socket.id).emit("receive-offer", {
        offer: room?.offer,
      });
    });
  }

  private handleOnSendAnswer(socket: Socket) {
    socket.on("send-answer", (request: SendAnswerEvent) => {
      const room = this.getRoom(request.roomName);

      this.io.to(room.owner).emit("receive-answer", {
        answer: request.answer,
      });
    });
  }

  private getRoom(roomName: string) {
    const room = this.rooms.find((r) => r.name === roomName);
    if (!room) {
      logger.error(`room ${roomName} not found!`);
      throw new Error("Room not found!");
    }

    return room;
  }

  initialize() {
    this.handleConnection();
  }
  listen() {
    logger.info("server running at port 3000");
    this.httpServer.listen(3000);
  }
}
