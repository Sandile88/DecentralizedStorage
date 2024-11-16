"use client";
import { useState } from "react";
import { pinata } from "@/utils/config";
import { uploadInChunks } from "@/utils/chunkUpload";

export default function Home() {
  const [file, setFile] = useState<File>();
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async () => {
    if (!file) {
      alert("No file selected");
      return;
    }

    try {
      setUploading(true);
      const chunks = await uploadInChunks(file);
      const fileId = crypto.randomUUID();
      const totalChunks = chunks.length;

      for (let i = 0; i < chunks.length; i++) {
        const formData = new FormData();
        formData.append('file', chunks[i]);
        formData.append('chunkIndex', i.toString());
        formData.append('totalChunks', totalChunks.toString());
        formData.append('fileId', fileId);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Upload failed for chunk ${i}`);
        }

        setProgress(((i + 1) / totalChunks) * 100);
      }

      const lastResponse = await pinata.gateways.convert(fileId);
      setUrl(lastResponse);
      
    } catch (e) {
      console.error(e);
      alert("Trouble uploading file");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target?.files?.[0]);
  };

  return (
    <main className="w-full min-h-screen m-auto flex flex-col justify-center items-center gap-4">
      <input type="file" onChange={handleChange} />
      <button 
        type="button" 
        disabled={uploading} 
        onClick={uploadFile}
        className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
      
      {uploading && (
        <div className="w-64 h-4 bg-gray-200 rounded">
          <div 
            className="h-full bg-blue-500 rounded transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      
      {url && <img src={url} alt="Image from Pinata" className="max-w-md" />}
    </main>
  );
}