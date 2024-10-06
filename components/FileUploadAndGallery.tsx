'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EventWithAttendance } from '@/types/general-types';

type FileInfo = {
    url: string;
    cid: string;
};

interface FileUploadAndGalleryProps {
    event: EventWithAttendance;
}

export default function FileUploadAndGallery({ event }: FileUploadAndGalleryProps) {
    const [files, setFiles] = useState<FileInfo[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchFiles(event.event_id);
    }, [event]);

    const fetchFiles = async (eventId: string) => {
        try {
            const response = await fetch(`/api/files?eventId=${eventId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch files');
            }
            const data = await response.json();
            setFiles(data);
        } catch (err) {
            setError('Failed to fetch files');
            console.error(err);
        }
    };

    const handleFileUpload = async (ev: React.ChangeEvent<HTMLInputElement>) => {
        const file = ev.target.files?.[0];
        if (!file) {
            setError('No file selected');
            return;
        }

        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch(`/api/files?eventId=${event.event_id}`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            const data = await response.json();
            setFiles(prevFiles => [...prevFiles, data]);
        } catch (err) {
            setError('Failed to upload file');
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="grid grid-cols-2 gap-x-4">
            <div>
                <div className="flex flex-col gap-y-4">
                    <p className="text-lg font-medium">{event.start_timestamp}</p>
                </div>
                <CardContent>
                    <Input
                        id="fileInput"
                        type="file"
                        onChange={handleFileUpload}
                        disabled={isUploading}
                        className="mb-2"
                    />
                    <Button
                        onClick={() => document.getElementById('fileInput')?.click()}
                        disabled={isUploading}
                        className="w-full"
                    >
                        {isUploading ? 'Uploading...' : 'Upload File'}
                    </Button>
                    {error && <p className="text-red-500 mt-2">{error}</p>}
                </CardContent>
            </div>

            <div>
                <CardHeader>
                    <CardTitle>File Gallery</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                        {files.map((file, index) => (
                            <div key={index} className="aspect-square">
                                <img
                                    src={file.url}
                                    alt={`Uploaded file ${index + 1}`}
                                    className="w-full h-full object-cover rounded"
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </div>
        </div>
    );
}