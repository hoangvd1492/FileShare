import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";
import type { FileDownloadMeta } from "../component/file-store/FileStore";

const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

type FileMeta = {
  status: "IDLE" | "PENDING" | "PROGRESS" | "DONE" | "ERROR";
  percent: number;
  bytesReceived: number;
  totalBytes: number;
  fileName: string;
  errorMessage?: string;
};

const initialMeta: FileMeta = {
  status: "IDLE",
  percent: 0,
  bytesReceived: 0,
  totalBytes: 0,
  fileName: "",
};

const getMimeType = (fileName: string): string => {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    pdf: "application/pdf",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    mp4: "video/mp4",
    mp3: "audio/mpeg",
    zip: "application/zip",
    txt: "text/plain",
    json: "application/json",
  };
  return map[ext] ?? "application/octet-stream";
};

export const useRTCReceiver = (
  socket: Socket,
  peerID: string,
  onFileReceived: (file: FileDownloadMeta) => void,
) => {
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  const [meta, setMeta] = useState<FileMeta>(initialMeta);

  useEffect(() => {
    const handleOffer = async ({
      from,
      offer,
      meta,
    }: {
      from: string;
      offer: RTCSessionDescriptionInit;
      meta: { name: string; size: number };
    }) => {
      try {
        if (from !== peerID) return;

        setMeta({
          status: "PENDING",
          percent: 0,
          bytesReceived: 0,
          totalBytes: meta.size,
          fileName: meta.name,
        });

        await setupReceiver(offer, meta);
      } catch (error) {
        console.error("Error set up receiver:", error);
        setMeta((prev) => ({
          ...prev,
          status: "ERROR",
          errorMessage: "Không thể thiết lập kết nối với sender.",
        }));
      }
    };

    const handleICE = async ({
      from,
      candidate,
    }: {
      from: string;
      candidate: RTCIceCandidateInit;
    }) => {
      try {
        if (from !== peerID) return;
        await setupICE(candidate);
      } catch (e) {
        console.error("Error adding ICE candidate:", e);
      }
    };

    socket.on("peer:offer", handleOffer);
    socket.on("peer:ice", handleICE);

    return () => {
      socket.off("peer:offer", handleOffer);
      socket.off("peer:ice", handleICE);
      clear();
    };
  }, [socket, peerID]);

  const setupReceiver = async (
    offer: RTCSessionDescriptionInit,
    fileMeta: { name: string; size: number },
  ) => {
    peerRef.current = new RTCPeerConnection(configuration);

    peerRef.current.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("peer:ice", { to: peerID, candidate: e.candidate });
      }
    };

    peerRef.current.onconnectionstatechange = () => {
      const state = peerRef.current?.connectionState;
      if (state === "failed" || state === "disconnected") {
        setMeta((prev) => ({
          ...prev,
          status: "ERROR",
          errorMessage: "Kết nối WebRTC bị gián đoạn.",
        }));
        clear();
      }
    };

    peerRef.current.ondatachannel = (event) => {
      const channel = event.channel;
      dataChannelRef.current = channel;
      channel.binaryType = "arraybuffer";

      let receiveData: ArrayBuffer[] = [];
      let bytesReceived = 0;

      channel.onopen = () => {
        console.log("DataChannel opened (receiver)");
        setMeta((prev) => ({ ...prev, status: "PROGRESS" }));
      };

      channel.onmessage = (e) => {
        if (e.data instanceof ArrayBuffer) {
          receiveData.push(e.data);
          bytesReceived += e.data.byteLength;

          const percent = Math.min(
            Math.round((bytesReceived / fileMeta.size) * 100),
            99,
          );
          setMeta((prev) => ({ ...prev, bytesReceived, percent }));
          return;
        }

        if (e.data === "EOF") {
          const blob = new Blob(receiveData, {
            type: getMimeType(fileMeta.name),
          });

          const newFile: FileDownloadMeta = {
            fileName: fileMeta.name,
            fileSize: fileMeta.size,
            blob,
          };

          onFileReceived(newFile);

          channel.send("ACK");
          setMeta((prev) => ({ ...prev, status: "DONE", percent: 100 }));
          channel.close();

          receiveData = [];
          bytesReceived = 0;
        }
      };

      channel.onerror = (e) => {
        console.error("DataChannel error:", e);
        setMeta((prev) => ({
          ...prev,
          status: "ERROR",
          errorMessage: "DataChannel gặp lỗi.",
        }));
      };

      channel.onclose = () => {
        console.log("DataChannel closed (receiver)");
        clear();
      };
    };

    await peerRef.current.setRemoteDescription(offer);
    const answer = await peerRef.current.createAnswer();
    await peerRef.current.setLocalDescription(answer);
    socket.emit("peer:answer", { to: peerID, answer });
  };

  const setupICE = async (candidate: RTCIceCandidateInit) => {
    if (!peerRef.current) return;
    await peerRef.current.addIceCandidate(new RTCIceCandidate(candidate));
  };

  const clear = () => {
    if (dataChannelRef.current) {
      dataChannelRef.current = null;
    }

    if (peerRef.current) {
      peerRef.current = null;
    }
  };

  return { meta };
};
