import React, { useContext, useState, type PropsWithChildren } from "react";
import { FilesPopup } from "../file-popup/FilesPopup";

export interface FileDownloadMeta {
  fileName: string;
  fileSize: number;
  blob: Blob;
}

interface Props {
  files: FileDownloadMeta[];

  addFile: (file: FileDownloadMeta) => void;
}

const FileStore = React.createContext<Props>({
  files: [],
  addFile: () => {},
});

export const FilesProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [files, setFiles] = useState<FileDownloadMeta[]>([]);

  const addFile = (file: FileDownloadMeta) => {
    setFiles((prev) => [...prev, file]);
  };

  return (
    <FileStore value={{ files: files, addFile: addFile }}>
      {children}
      <FilesPopup />
    </FileStore>
  );
};

export const useFileStore = () => {
  const context = useContext(FileStore);
  if (!context) {
    throw new Error("useFileStore must be used within a FilesProvider");
  }
  return context;
};
