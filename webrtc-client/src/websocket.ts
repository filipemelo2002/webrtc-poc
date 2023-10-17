import { Socket, io } from "socket.io-client";

type CallBack = (...args: any[]) => void;

export interface OnReceiveOfferData {
  offer: RTCSessionDescriptionInit
}
export interface OnReceiveAnswerData {
  answer: RTCSessionDescriptionInit;
}

export interface OnUserJoinData {
  userId: string;
}
export class WebSocket {
  private socket: Socket;

  constructor() {
    this.socket = io("http://localhost:3000");
  }

  createRoom(roomName: string) {
    this.socket.emit("create-room", {
      roomName,
    });
  }

  joinRoom(roomName: string) {
    this.socket.emit("join-room", {
      roomName,
    });
  }

  onReceiveOffer(cb: CallBack) {
    this.socket.on("receive-offer", cb);
  }

  onUserJoin(cb: CallBack) {
    this.socket.on("user-join", cb);
  }

  sendOffer(userId: string, offer: RTCSessionDescriptionInit) {
    this.socket.emit('send-offer', {
      userId,
      offer
    })
  }

  sendAnswer(answer: RTCSessionDescriptionInit, roomName: string) {
    this.socket.emit("send-answer", {
      answer,
      roomName,
    });
  }

  onReceiveAnswer(cb: CallBack) {
    this.socket.on("receive-answer", cb);
  }
}
