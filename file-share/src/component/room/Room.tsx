import { useParams } from "react-router-dom";
import { SocketProvider, useSocket } from "../../hooks/use-socket";
import React from "react";
import { CardList } from "../card/CardList";

const Room = () => {
  return (
    <React.Fragment>
      <RoomControl />
      <CardList />
    </React.Fragment>
  );
};
const RoomControl = () => {
  const { id } = useParams();
  const { user } = useSocket();

  const handleCopyCode = async () => {
    if (!id) return;
    try {
      navigator.clipboard.writeText(id);
      alert("Copied!");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-1/2 max-w-[500px] min-w-[300px] ">
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

      <div className="flex flex-row gap-2 items-center justify-between">
        <label htmlFor="name" className="text-xl font-[500]">
          Room Code:
        </label>
        <input
          className="border-4 px-4 py-2 outline-none shadow"
          id="name"
          disabled
          value={id}
        ></input>
      </div>
      <div className="self-end flex flex-row gap-2">
        <button className="btn shadow bg-green-600" onClick={handleCopyCode}>
          Copy Code
        </button>
      </div>
    </div>
  );
};
const RoomWrapper = () => {
  const { id } = useParams();

  return (
    <SocketProvider roomID={id}>
      <Room />
    </SocketProvider>
  );
};

export default RoomWrapper;
