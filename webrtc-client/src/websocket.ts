import { Socket, io } from "socket.io-client";

type CallBack = (...args: any[]) => void;

export interface OnReceiveOfferData {
  offer: RTCSessionDescriptionInit
}
export interface OnReceiveAnswerData {
  answer: RTCSessionDescriptionInit;
}
export class WebSocket {
  private socket: Socket;

  constructor() {
    this.socket = io("http://localhost:3000");
  }

  sendOffer(offer: RTCSessionDescriptionInit, roomName: string) {
    this.socket.emit("create-room", {
      offer,
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
