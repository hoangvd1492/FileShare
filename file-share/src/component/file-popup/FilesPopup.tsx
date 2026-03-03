import { FileDown, Ghost, X } from "lucide-react";
import { useState } from "react";
import { useFileStore } from "../file-store/FileStore";

export const FilesPopup = () => {
  const [open, setOpen] = useState(false);

  const { files } = useFileStore();

  const handleDownload = (file: { fileName: string; blob: Blob }) => {
    const url = URL.createObjectURL(file.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  };

  return (
    <>
      {!open && (
        <div
          className="fixed bottom-5 right-5 rounded-full border-2 shadow2 p-2 cursor-pointer fadeIn"
          onClick={() => setOpen(true)}
        >
          <FileDown />
          {files.length > 0 && (
            <>
              {/* Vòng ping */}
              <span className="absolute -top-[2px] right-[2px] flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </>
          )}
        </div>
      )}
      {open && (
        <div
          className="fixed bottom-5 right-5 bg-[white] border-4 shadow px-4 py-10 fadeIn"
          style={{ height: 500, width: 300 }}
        >
          <div
            className="absolute top-2 right-2 cursor-pointer text-gray-600 hover:text-black "
            onClick={() => setOpen(false)}
          >
            <X />
          </div>

          {files.length ? (
            <div className="overflow-y-auto h-full scrollbar pr-1">
              <div className="flex flex-col gap-4">
                {files.map((file) => (
                  <div
                    key={file.fileName}
                    className="flex flex-row justify-between"
                  >
                    <div className="w-1/2 truncate">{file.fileName}</div>
                    <button
                      className="btn bg-green-700 text-sm px-2! py-1!"
                      onClick={() => handleDownload(file)}
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              <Ghost size={32} />
              <span className=" text-gray-500">No files available!</span>
            </div>
          )}
        </div>
      )}
    </>
  );
};
