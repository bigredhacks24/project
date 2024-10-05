"use client";

import { useState } from "react";

interface FileUploadFormProps {
  onUploadComplete?: (file: { url: string; cid: string }) => void;
  userId: string;
}

export default function FileUploadForm({ onUploadComplete, userId }: FileUploadFormProps) {
    const [file, setFile] = useState<File>();
    const [uploading, setUploading] = useState(false);

    const uploadFile = async () => {
        try {
            if (!file) {
                alert("No file selected");
                return;
            }

            setUploading(true);
            const data = new FormData();
            data.set("file", file);
            const uploadRequest = await fetch(`/api/files?userId=${userId}`, {
                method: "POST",
                body: data,
            });
            const response = await uploadRequest.json();
            setUploading(false);
            if (onUploadComplete) {
                onUploadComplete(response);
            }
        } catch (e) {
            console.log(e);
            setUploading(false);
            alert("Trouble uploading file");
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFile(e.target?.files?.[0]);
    };

    return (
        <div className="flex flex-col items-center space-y-4">
            <input type="file" onChange={handleChange} className="mb-2" />
            <button
                disabled={uploading}
                onClick={uploadFile}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
                {uploading ? "Uploading..." : "Upload"}
            </button>
        </div>
    );
}
