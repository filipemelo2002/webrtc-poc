type CallBack = (stream: MediaStream) => void;

type ICECallBack = (candidate: RTCIceCandidate) => void;

export class WebRTC {
  private peerConnection: RTCPeerConnection;
  mediaStream: MediaStream | null = null;

  constructor() {
    const configuration: RTCConfiguration = {
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    };
    this.peerConnection = new RTCPeerConnection(configuration);

    this.peerConnection.oniceconnectionstatechange = () => {
      console.log(
        "ice connection state: ",
        this.peerConnection.iceConnectionState
      );
    };

    this.peerConnection.onconnectionstatechange = () => {
      console.log("connection state: ", this.peerConnection.connectionState);
    };

    this.peerConnection.onnegotiationneeded  = () => {
      console.log("renegotiation is needed ", this.peerConnection.connectionState)
    }
  }

  async getMediaStream() {
    const mediaStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });
    this.mediaStream = mediaStream;
    mediaStream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, mediaStream);
    });
    return mediaStream;
  }

  async makeOffer() {
    const offer = await this.peerConnection.createOffer();
    return offer;
  }

  async makeAnswer() {
    const answer = await this.peerConnection.createAnswer();
    return answer;
  }

  async setRemoteOffer(offer: RTCSessionDescriptionInit) {
    console.log("remote offer: ", offer);
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
  }

  async setLocalOffer(offer: RTCSessionDescriptionInit) {
    console.log("local offer: ", offer);
    await this.peerConnection.setLocalDescription(offer);
  }

  onICECandidateChange(cb: ICECallBack) {
    this.peerConnection.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate) {
        cb(event.candidate);
      }
    }
  }

  async setICECandidate(candidate: RTCIceCandidate) {
    await this.peerConnection.addIceCandidate(candidate);
  }
  
  onStream(cb: CallBack) {
    this.peerConnection.ontrack = function ({ streams: [stream] }) {
      console.log(stream)
      cb(stream);
    };
  }
}
