import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";

const configuration = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const CHUNK_SIZE = 16384;

type FileMeta = {
  status: "IDLE" | "PENDING" | "PROGRESS" | "DONE" | "ERROR";
  percent: number;
  bytesSent: number;
  totalBytes: number;
  fileName: string;
  errorMessage?: string;
};

const initialMeta: FileMeta = {
  status: "IDLE",
  percent: 0,
  bytesSent: 0,
  totalBytes: 0,
  fileName: "",
};

export const useWebRTCSender = (
  socket: Socket,
  peerID: string,
  file: File | null,
) => {
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const dataChannelRef = useRef<RTCDataChannel | null>(null);

  const [meta, setMeta] = useState<FileMeta>(initialMeta);

  useEffect(() => {
    const handleAnswer = async ({
      from,
      answer,
    }: {
      from: string;
      answer: RTCSessionDescriptionInit;
    }) => {
      try {
        if (from !== peerID) return;
        await setupAnswer(answer);
      } catch (error) {
        console.error("Error add answer:", error);
        setMeta((prev) => ({
          ...prev,
          status: "ERROR",
          errorMessage: "Không thể thiết lập kết nối với receiver.",
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

    socket.on("peer:answer", handleAnswer);
    socket.on("peer:ice", handleICE);

    return () => {
      socket.off("peer:answer", handleAnswer);
      socket.off("peer:ice", handleICE);
      clear();
    };
  }, [socket, peerID]);

  useEffect(() => {
    setMeta({
      status: "IDLE",
      percent: 0,
      bytesSent: 0,
      totalBytes: file ? file.size : 0,
      fileName: file ? file.name : "",
    });
  }, [file]);

  const sendFile = async () => {
    if (!file || file.size === 0) {
      alert("File không hợp lệ!");
      return;
    }

    // Reset meta trước khi gửi
    setMeta({
      status: "PENDING",
      percent: 0,
      bytesSent: 0,
      totalBytes: file.size,
      fileName: file.name,
    });

    try {
      await setupSender(file);
    } catch (error) {
      console.error(error);
      setMeta((prev) => ({
        ...prev,
        status: "ERROR",
        errorMessage: "Đã xảy ra lỗi khi gửi file.",
      }));
    }
  };

  const setupSender = async (file: File) => {
    // Tạo peer
    peerRef.current = new RTCPeerConnection(configuration);

    peerRef.current.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("peer:ice", {
          to: peerID,
          candidate: e.candidate,
        });
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

    // Tạo data channel
    dataChannelRef.current = peerRef.current.createDataChannel("file");
    const channel = dataChannelRef.current;

    // Gửi file khi channel mở
    channel.onopen = () => {
      console.log("DataChannel opened (sender)");
      setMeta((prev) => ({ ...prev, status: "PROGRESS" }));

      const fileReader = new FileReader();
      let offset = 0;

      fileReader.addEventListener("error", () => {
        setMeta((prev) => ({
          ...prev,
          status: "ERROR",
          errorMessage: "Đọc file thất bại.",
        }));
      });

      fileReader.addEventListener("abort", () => {
        setMeta((prev) => ({
          ...prev,
          status: "ERROR",
          errorMessage: "Đọc file bị hủy.",
        }));
      });

      fileReader.addEventListener("load", (e) => {
        const result = e.target?.result;
        if (!(result instanceof ArrayBuffer)) return;

        // Chờ buffer không bị đầy trước khi gửi
        if (channel.bufferedAmount > CHUNK_SIZE * 8) {
          channel.onbufferedamountlow = () => {
            channel.onbufferedamountlow = null;
            channel.send(result);
            offset += result.byteLength;
            updateProgress(offset, file.size);
            if (offset < file.size) readSlice(offset);
            else channel.send("EOF");
          };
          channel.bufferedAmountLowThreshold = CHUNK_SIZE * 4;
        } else {
          channel.send(result);
          offset += result.byteLength;
          updateProgress(offset, file.size);
          if (offset < file.size) readSlice(offset);
          else channel.send("EOF");
        }
      });

      const readSlice = (o: number) => {
        const slice = file.slice(o, o + CHUNK_SIZE);
        fileReader.readAsArrayBuffer(slice);
      };

      readSlice(0);
    };

    // Nhận ACK từ receiver → xác nhận DONE
    channel.onmessage = (e) => {
      if (e.data === "ACK") {
        setMeta((prev) => ({ ...prev, status: "DONE", percent: 100 }));
        channel.close();
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
      console.log("DataChannel closed (sender)");
      clear();
    };

    // Tạo và emit offer
    const offer = await peerRef.current.createOffer();
    await peerRef.current.setLocalDescription(offer);
    socket.emit("peer:offer", {
      to: peerID,
      offer,
      meta: {
        name: file.name,
        size: file.size,
      },
    });
  };

  const updateProgress = (bytesSent: number, totalBytes: number) => {
    const percent = Math.min(Math.round((bytesSent / totalBytes) * 100), 99); // 99% chờ ACK mới 100%
    setMeta((prev) => ({ ...prev, bytesSent, percent }));
  };

  const setupAnswer = async (answer: RTCSessionDescriptionInit) => {
    if (!peerRef.current) return;
    await peerRef.current.setRemoteDescription(answer);
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

  return { sendFile, meta };
};
