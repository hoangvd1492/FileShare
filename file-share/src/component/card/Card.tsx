import { Upload } from "lucide-react";
import { useState } from "react";
import { useSocket } from "../../hooks/use-socket";
import { useWebRTCSender } from "../../hooks/use-rtc-sender";
import { useRTCReceiver } from "../../hooks/use-rtc-receiver";
import { ProgressBar, ProgressBarSkeleton } from "../progress/ProgressBar";
import { useFileStore, type FileDownloadMeta } from "../file-store/FileStore";

export const Card: React.FC<{ data: any }> = ({ data }) => {
  const { socket } = useSocket();
  if (!socket) {
    throw new Error("Socket was not provided!");
  }

  const { addFile } = useFileStore();

  const [file, setFile] = useState<File | null>(null);

  const { meta: fileOutMeta, sendFile } = useWebRTCSender(
    socket,
    data.id,
    file,
  );

  const handleFileReceived = (file: FileDownloadMeta) => {
    addFile(file);
  };

  const { meta: fileComeMeta } = useRTCReceiver(
    socket,
    data.id,
    handleFileReceived,
  );

  const handleChangeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files;
    if (!selectedFile) return;
    setFile(selectedFile[0]);
  };

  return (
    <div className="card shadow shrink-0">
      <div className="flex flex-col">
        <div className="flex flex-row justify-between items-center">
          <div>
            <div className="text-xl font-[900]">{data.name}</div>
            <div className="flex items-center flex-row text-sm font-[600]">
              <span>{data.os}</span>
              &#9679;
              <span>{data.browser}</span>
            </div>
          </div>
          <div className="flex flex-row gap-4 items-center">
            {fileOutMeta.status !== "PROGRESS" && (
              <div>
                <label htmlFor={`file_${data.id}`} className="cursor-pointer">
                  <Upload />
                </label>
                <input
                  id={`file_${data.id}`}
                  hidden
                  type="file"
                  onChange={handleChangeFile}
                />
              </div>
            )}
          </div>
        </div>

        {file && (
          <>
            <hr className="my-4" />
            <div>
              <div className="text-xl font-[900]">File gửi:</div>
              <div className="flex justify-between">
                <div className="w-1/2 truncate">
                  <span>{file.name}</span>
                </div>
                <div className="grow">
                  <div className="text-end text-sm">
                    <span>
                      {fileOutMeta.bytesSent} / {fileOutMeta.totalBytes} (
                      {fileOutMeta.percent}%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full">
                {fileOutMeta.status === "IDLE" && (
                  <button
                    className="btn shadow bg-green-600"
                    onClick={sendFile}
                  >
                    Gửi
                  </button>
                )}
                {fileOutMeta.status === "PENDING" && <ProgressBarSkeleton />}
                {fileOutMeta.status === "PROGRESS" && (
                  <ProgressBar percent={fileOutMeta.percent} />
                )}
                {fileOutMeta.status === "DONE" && (
                  <div className="text-green-600 font-bold text-sm">
                    <span>Gửi File thành công</span>
                  </div>
                )}
                {fileOutMeta.status === "ERROR" && (
                  <div className="text-red-600 font-bold text-sm">
                    <span>Lỗi: {fileOutMeta.errorMessage}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
        {fileComeMeta.status !== "IDLE" && (
          <>
            <hr className="my-4" />
            <div>
              <div className="text-xl font-[900]">File nhận:</div>
              <div className="flex justify-between">
                <div className="w-1/2 truncate">
                  <span>{fileComeMeta.fileName}</span>
                </div>
                <div className="grow">
                  <div className="text-end text-sm">
                    <span>
                      {fileComeMeta.bytesReceived} / {fileComeMeta.totalBytes} (
                      {fileComeMeta.percent}%)
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full">
                {fileComeMeta.status === "PENDING" && <ProgressBarSkeleton />}
                {fileComeMeta.status === "PROGRESS" && (
                  <ProgressBar percent={fileComeMeta.percent} />
                )}
                {fileComeMeta.status === "DONE" && (
                  <div className="text-green-600 font-bold text-sm">
                    <span>Nhận File thành công</span>
                  </div>
                )}
                {fileComeMeta.status === "ERROR" && (
                  <div className="text-red-600 font-bold text-sm">
                    <span>Lỗi: {fileComeMeta.errorMessage}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
