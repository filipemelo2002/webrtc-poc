import { useRef } from "react";
import { WebRTC } from "./webrtc";
import { OnReceiveOfferData, OnReceiveAnswerData, WebSocket } from "./websocket";

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
    const offer = await webRTC.makeOffer();
    webSocket.sendOffer(offer, inputRef.current.value);
    webSocket.onReceiveAnswer((data: OnReceiveAnswerData) => {
      webRTC.setRemoteOffer(data.answer);
    })
    startLocalVideo();
  };

  const onJoinRoom = () => {
    if (!inputRef.current?.value) {
      alert("Missing Room Name!");
      return;
    }

    webSocket.joinRoom(inputRef.current.value);
    
    webSocket.onReceiveOffer(async (data: OnReceiveOfferData) => {
      webRTC.setRemoteOffer(data.offer);
      const answer = await webRTC.makeAnswer();

      if (!inputRef.current?.value) {
        alert("could not send answer: missing room name!");
        return;
      }

      webSocket.sendAnswer(answer, inputRef.current.value);
    });

    webRTC.onStream(playVideo)
  };

  async function startLocalVideo() {
    const mediaDevice = await webRTC.getMediaStream();
    playVideo(mediaDevice);
  }


  function playVideo(mediaStream: MediaStream) {
    console.log("received media stream!!")
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
