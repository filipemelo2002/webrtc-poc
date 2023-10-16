import "./App.css";
import { useWebRTC } from "./App.state";

function App() {
  
  const {
    inputRef,
    videoRef,
    onCreateRoom,
    onJoinRoom
  } = useWebRTC();

  return (
    <div className="flex flex-col">
      <label
        htmlFor="UserEmail"
        className="block text-m font-medium text-gray-700"
      >
        Room name
      </label>

      <input
        type="email"
        ref={inputRef}
        id="UserEmail"
        placeholder="john@rhcp.com"
        className="mt-1 w-full rounded-md border border-blue-600 shadow-sm sm:text-sm px-5 py-3"
      />
      <div className="col-span-6 sm:flex sm:items-center sm:gap-4 mt-10">
        <button 
          onClick={onCreateRoom}
          className="inline-block shrink-0 rounded-md border border-blue-600 bg-blue-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-transparent hover:text-blue-600 focus:outline-none focus:ring active:text-blue-500">
          Create room
        </button>
        <button 
          onClick={onJoinRoom}
          className="inline-block shrink-0 rounded-md border  px-12 py-3 text-sm font-medium transition bg-transparent text-blue-600 focus:outline-none focus:ring active:text-blue-500">
          Join room
        </button>
      </div>
      <video autoPlay muted ref={videoRef}></video>
    </div>
  );
}

export default App;
