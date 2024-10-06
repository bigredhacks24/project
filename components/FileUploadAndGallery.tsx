'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EventWithAttendance } from '@/types/general-types';
import { format } from 'date-fns';

type FileInfo = {
    url: string;
    cid: string;
    isThumbnail: boolean;
};

interface FileUploadAndGalleryProps {
    event: EventWithAttendance;
}

export default function FileUploadAndGallery({ event }: FileUploadAndGalleryProps) {
    const [files, setFiles] = useState<FileInfo[]>([]);
    const [thumbnail, setThumbnail] = useState<FileInfo | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [key, setKey] = useState(0); // Add this line

    // TODO: still not re-rendering :(
    useEffect(() => {
        fetchFiles(event.event_id);
    }, [event, key]); // Add key to the dependency array

    const fetchFiles = async (eventId: string) => {
        try {
            const response = await fetch(`/api/files?eventId=${eventId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch files');
            }
            const data: FileInfo[] = await response.json();
            const thumbnailFile = data.find(file => file.isThumbnail);
            setThumbnail(thumbnailFile || null);
            setFiles(data.filter(file => !file.isThumbnail));
        } catch (err) {
            setError('Failed to fetch files');
            console.error(err);
        }
    };

    const handleFileUpload = async (ev: React.ChangeEvent<HTMLInputElement>, isThumbnail: boolean = false) => {
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
            const response = await fetch(`/api/files?eventId=${event.event_id}&thumbnail=${isThumbnail}`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }

            // Instead, trigger a re-fetch
            setKey(prevKey => prevKey + 1);

            // Clear the file input
            ev.target.value = '';
        } catch (err) {
            setError('Failed to upload file');
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    };

    const formatDateRange = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const dateStr = format(start, 'MMM do');
        const startTimeStr = format(start, 'h:mma');
        const endTimeStr = format(end, 'h:mma');
        return `${dateStr} ${startTimeStr} - ${endTimeStr}`;
    };

    return (
        <div className="p-4 grid grid-cols-2 w-full">
            <div className="border-r border-gray-300 pr-5">
                <div className="mb-6">
                    <p className="text-gray-400 text-sm font-medium">{formatDateRange(event.start_timestamp, event.end_timestamp)}</p>
                    <h2 className="text-2xl font-medium my-1 text-black">{event.name}</h2>
                    <p className="text-gray-400 text-sm">{event.description}</p>
                </div>

                <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2 colored">GUESTS</h3>
                    <div className="flex flex-col space-y-2">
                        {event.event_person_attendance.map((attendance, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-gray-300 rounded-full">
                                    <img src={attendance.person.profile_picture || "https://avatar.iran.liara.run/public"} alt={attendance.person.full_name} className="w-full h-full object-cover" />
                                </div>
                                <span>{attendance.person.full_name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="col-span-2">
                        <h3 className="text-lg font-semibold colored">EVENT THUMBNAIL</h3>
                        <p className="text-gray-400 mb-2 text-sm">Add a thumbnail to {event.name}'s page!</p>
                        <Input
                            id="thumbnailInput"
                            type="file"
                            onChange={(ev) => handleFileUpload(ev, true)}
                            disabled={isUploading}
                            className="hidden"
                        />
                        <Button
                            onClick={() => document.getElementById('thumbnailInput')?.click()}
                            disabled={isUploading}
                        >
                            {isUploading ? 'Uploading...' : 'Upload Thumbnail'}
                        </Button>
                        {error && <p className="text-red-500 mt-2">{error}</p>}
                    </div>
                    <div className="col-span-1">
                        {thumbnail ? (
                            <img src={thumbnail.url} alt="Event Thumbnail" className="w-full h-full object-cover" />
                        ) : (
                            <div className="aspect-square bg-gray-200"></div>
                        )}
                    </div>
                </div>
            </div>

            <div className="pl-5">
                <div>
                    <h3 className="text-lg font-semibold mb-2 colored">Upload Media</h3>
                    <p className="text-gray-400 mb-2 -mt-1">Add pics from <span className="font-semibold">{event.name}</span>!</p>
                    <Input
                        id="galleryInput"
                        type="file"
                        onChange={(ev) => handleFileUpload(ev, false)}
                        disabled={isUploading}
                        className="hidden"
                    />
                    <h3 className="text-lg font-semibold mb-2 colored">GALLERY</h3>
                    <Button
                        onClick={() => document.getElementById('galleryInput')?.click()}
                        disabled={isUploading}
                        className="mb-4"
                    >
                        {isUploading ? 'Uploading...' : 'Upload to Gallery'}
                    </Button>
                    <div className="grid grid-cols-4 gap-2">
                        {files.map((file, index) => (
                            <img key={index} src={file.url} alt={`Gallery image ${index + 1}`} className="aspect-square object-cover" />
                        ))}
                        {[...Array(8 - files.length)].map((_, index) => (
                            <div key={index + files.length} className="aspect-square bg-gray-200"></div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}