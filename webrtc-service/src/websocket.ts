import { Server, Socket } from "socket.io";
import { logger } from "./logger";
import {Server as HTTPServer, createServer} from 'node:http';

interface Room {
  users: string[];
  name: string;
  owner: string;
}

interface CreateRoomEvent {
  roomName: string;
}

interface JoinRoomEvent {
  roomName: string;
}

interface SendAnswerEvent {
  roomName: string;
  answer: RTCSessionDescription;
}

interface SendICECandidateEvent {
  roomName: string;
  candidate: RTCIceCandidate;
}

interface SendOfferEvent {
  offer: RTCSessionDescriptionInit;
  userId: string;
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
      this.handleOnSendOffer(socket);
      this.handleOnSendICECandidate(socket);
    });
  }

  private handleOnCreateRoom(socket: Socket) {
    socket.on("create-room", (request: CreateRoomEvent) => {
      this.rooms.push({
        name: request.roomName,
        users: [],
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
      this.io.to(room.owner).emit("user-join", {
        userId: socket.id,
      });
    });
  }

  private handleOnSendOffer(socket: Socket) {
    socket.on('send-offer', (request: SendOfferEvent) => {
      const {userId, offer} = request;
      logger.info(`user ${userId} is receiving offer`);
      this.io.to(userId).emit('receive-offer', {
        offer
      })
    })
  }

  private handleOnSendAnswer(socket: Socket) {
    socket.on("send-answer", (request: SendAnswerEvent) => {
      const room = this.getRoom(request.roomName);
      logger.info(`user ${room.owner} is receiving answer`);
      this.io.to(room.owner).emit("receive-answer", {
        answer: request.answer,
      });
    });
  }

  private handleOnSendICECandidate(socket: Socket) {
    socket.on('send-ice-candidate', (request: SendICECandidateEvent) => {
      const room = this.getRoom(request.roomName);
      const isRoomOwner = room.owner === socket.id;
      let userId = '';
      if  (isRoomOwner) {
        [userId] = room.users;
      } else {
        userId = room.owner;
      }

      logger.info(`user ${userId} is receiving new ICE Candidate`);

      this.io.to(userId).emit('receive-ice-candidate', {
        candidate: request.candidate
      })
    })
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
