import React, { useState } from "react";
import { SocketProvider, useSocket } from "../../hooks/use-socket";
import { CardList } from "../card/CardList";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { generateId } from "../../helpers";

const Lan = () => {
  return (
    <React.Fragment>
      <LanControl />
      <CardList />
    </React.Fragment>
  );
};

const LanControl = () => {
  const { user } = useSocket();
  const navigate = useNavigate();

  const [code, setCode] = useState("");

  const handleChangeCode = (e: any) => {
    setCode(e.target.value);
  };

  const navigateToRoom = () => {
    if (!code || !code.trim()) return;
    navigate(`room/${code.trim()}`);
  };

  const handleCreateRoom = () => {
    const roomId = generateId();
    navigate(`/room/${roomId}`);
  };
  return (
    <div className="flex flex-col gap-4 w-1/2 max-w-[500px] min-w-[300px]">
      <div className="flex flex-row gap-2 items-center justify-between">
        <label htmlFor="name" className="text-xl font-[500]">
          Your Name:
        </label>
        <input
          className="border-4 px-4 py-2 outline-none shadow"
          id="name"
          value={user.name}
          disabled
        ></input>
      </div>

      <div className="flex flex-row justify-between items-center">
        <label htmlFor="code" className="text-xl font-[500]">
          Join Room:
        </label>
        <input
          id="code"
          className="border-4 px-4 py-2 outline-none shadow"
          placeholder="Code. . ."
          value={code}
          onChange={handleChangeCode}
        />
      </div>
      <div className="self-end flex flex-row gap-2">
        <button
          className="btn shadow bg-yellow-500"
          disabled={!code || !code.trim()}
          onClick={navigateToRoom}
        >
          Join <LogIn />
        </button>

        <button className="btn shadow bg-green-700" onClick={handleCreateRoom}>
          Create Room
        </button>
      </div>
    </div>
  );
};

const LanWrapper = () => {
  return (
    <SocketProvider>
      <Lan />
    </SocketProvider>
  );
};

export default LanWrapper;
