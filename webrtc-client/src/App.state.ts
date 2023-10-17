import { useRef } from "react";
import { WebRTC } from "./webrtc";
import { OnReceiveOfferData, OnReceiveAnswerData, WebSocket, OnUserJoinData } from "./websocket";

const webRTC = new WebRTC();
const webSocket = new WebSocket();

export function useWebRTC() {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const onCreateRoom = async () => {
    if (!inputRef.current?.value) {
      alert("Missing Room Name!");
      return;
    }

    webSocket.createRoom(inputRef.current.value);
    console.log('create room')

    webSocket.onUserJoin(async (data: OnUserJoinData) => {
      console.log('sending offer to ', data.userId);
      const offer = await webRTC.makeOffer();
      await webRTC.setLocalOffer(offer);
      webSocket.sendOffer(data.userId, offer);
    });
  
    webSocket.onReceiveAnswer((data: OnReceiveAnswerData) => {
      console.log('received remote answer')
      webRTC.setRemoteOffer(data.answer);
    })
    
    await startLocalVideo();
  };

  const onJoinRoom = () => {
    if (!inputRef.current?.value) {
      alert("Missing Room Name!");
      return;
    }

    webSocket.joinRoom(inputRef.current.value);
    
    webSocket.onReceiveOffer(async (data: OnReceiveOfferData) => {
      console.log('received remote offer')
      await webRTC.setRemoteOffer(data.offer);
      const answer = await webRTC.makeAnswer();
      await webRTC.setLocalOffer(answer);
      
      if (!inputRef.current?.value) {
        alert("could not send answer: missing room name!");
        return;
      }
      console.log('send answer')
      webSocket.sendAnswer(answer, inputRef.current.value);
    });
    
    webRTC.onStream(playVideo)
  };

  async function startLocalVideo() {
    const mediaDevice = await webRTC.getMediaStream();
    playVideo(mediaDevice);
  }


  function playVideo(mediaStream: MediaStream) {
    if (!videoRef.current) {
      alert("Missing video tag!");
      return;
    }
    videoRef.current.srcObject = mediaStream;
  }

  return {
    onCreateRoom,
    onJoinRoom,
    inputRef,
    videoRef,
  };
}
