import { Route, Routes } from "react-router-dom";
import "./App.css";
import { Navbar } from "./component/navbar/Navbar";
import Lan from "./component/lan/Lan";
import Room from "./component/room/Room";

const isWebRTCSupported = () => {
  return (
    typeof window !== "undefined" &&
    typeof window.RTCPeerConnection !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia
  );
};

function App() {
  const supported = isWebRTCSupported();

  if (!supported) {
    return (
      <div className="h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-center px-4">
          <div>
            <h1 className="text-xl font-semibold mb-2">
              Trình duyệt không hỗ trợ WebRTC
            </h1>
            <p className="text-gray-500">
              Vui lòng sử dụng Chrome, Edge hoặc Firefox phiên bản mới.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div
        className="app-container flex flex-col items-center mb-8"
        style={{ height: "calc(100vh - var(--navbar-height))" }}
      >
        <Routes>
          <Route path="/" element={<Lan />} />
          <Route path="/room/:id" element={<Room />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
