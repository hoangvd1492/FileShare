import { useSocket } from "../../hooks/use-socket";
import { Card } from "./Card";

export const CardList = () => {
  const { peers } = useSocket();
  return (
    <div className="flex flex-col py-2 px-4 gap-4 w-full md:w-1/2 max-w-[750px] md:min-w-[300px] mt-16">
      {peers.map((peer) => {
        return <Card key={peer.id} data={peer} />;
      })}
    </div>
  );
};
