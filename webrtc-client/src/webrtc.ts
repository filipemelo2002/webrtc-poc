type CallBack = (stream: MediaStream) => void;

export class WebRTC {
  private peerConnection: RTCPeerConnection;
  mediaStream: MediaStream | null = null;

  constructor() {
    this.peerConnection = new RTCPeerConnection();

    this.peerConnection.oniceconnectionstatechange = () => {
      console.log('ice connection state: ', this.peerConnection.iceConnectionState)
    }

    this.peerConnection.onconnectionstatechange = () => {
      console.log('connection state: ', this.peerConnection.connectionState)
    }
  }

  async getMediaStream() {
    const mediaStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });
    this.mediaStream = mediaStream;
    mediaStream.getTracks().forEach(track => {
      this.peerConnection.addTrack(track, mediaStream);
    });
    return mediaStream;
  }

  async makeOffer() {
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);
    return offer;
  }

  async makeAnswer() {
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);
    return answer;
  }

  setRemoteOffer(offer: RTCSessionDescriptionInit) {
    this.peerConnection.setRemoteDescription(offer);
  }

  onStream(cb: CallBack) {
    this.peerConnection.ontrack = function ({ streams: [stream] }) {
      cb(stream);
    };
  }
}
