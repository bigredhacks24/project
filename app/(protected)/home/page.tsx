"use client";

import { InfoIcon } from "lucide-react";
import GoogleCalendarComponent from "@/components/GoogleCalendarComponent";
import FileUploadForm from "@/components/file-upload-form";
import { useState, useEffect } from "react";
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';

interface UploadedFile {
  url: string;
  cid: string;
}

export default function ProtectedPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndFiles = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { data: { user }, error: userError } = await createClient().auth.getUser();
        if (userError) throw userError;
        setUser(user);

        if (user?.id) {
          const response = await fetch(`/api/files?userId=${user.id}`);
          if (!response.ok) throw new Error('Failed to fetch files');
          const files = await response.json();
          setUploadedFiles(files);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch user data and files');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAndFiles();
  }, []);

  const handleUploadComplete = (newFile: UploadedFile) => {
    setUploadedFiles(prevFiles => [...prevFiles, newFile]);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !user) {
    return <div>Error: {error || 'User not found'}</div>;
  }

import HoverCard from "@/components/HoverCard"; // Adjust the import path as necessary

export default async function Home() {
  return (
    <div className="flex w-[1222px] h-[881px] flex-col items-start gap-[72px] shrink-0">
      <div className="flex flex-col items-start gap-6 self-stretch">
        <div className="w-full flex flex-col items-start gap-6">
          <div className="flex p-2.5 justify-center items-center gap-2.5">
            <div className="text-black font-roboto text-[36px] font-medium leading-[20.25px] tracking-[0.338px]">
              Upcoming Events
            </div>
            {/* <div className="flex items-start gap-9 self-stretch"></div> */}
          </div>
          <div className="flex items-start gap-3 self-stretch">
            <div className="flex h-[313px] items-start gap-3 self-stretch">
              <HoverCard>
                {/* Content for the first card */}
                <h3 className="font-bold">Card Title 1</h3>
                <p>Some description for card 1.</p>
              </HoverCard>
              <HoverCard>
                {/* Content for the first card */}
                <h3 className="font-bold">Card Title 1</h3>
                <p>Some description for card 1.</p>
              </HoverCard>
            </div>
          </div>
        </div>
        <div className="flex items-start gap-4 self-stretch">
          <div className="flex flex-col items-start gap-6 flex-1">
            <div className="flex items-start gap-6">
              <div className="text-black font-roboto text-[36px] font-medium leading-[20.25px] tracking-[0.338px]">
                Your Circles
              </div>
            </div>
            <div className="flex flex-col items-start gap-2 self-stretch"></div>
          </div>
          <div className="flex flex-col items-start gap-6 flex-1">
            <div className="flex items-start gap-6">
              <div className="text-black font-roboto text-[36px] font-medium leading-[20.25px] tracking-[0.338px]">
                Your Friends
              </div>
            </div>
          </div>
        </div>

        <div className="w-full max-w-md mx-auto">
          <h2 className="font-bold text-2xl mb-4">File Upload</h2>
          <FileUploadForm onUploadComplete={handleUploadComplete} userId={user.id} />
          {uploadedFiles.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-lg mb-2">Uploaded Images:</h3>
              <div className="grid grid-cols-2 gap-4">
                {uploadedFiles.map((file, index) => (
                  <img key={file.cid} src={file.url} alt={`Uploaded image ${index + 1}`} className="w-full h-auto rounded-lg shadow-md" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-bold text-2xl mb-4">Google Calendar Integration</h2>
        <GoogleCalendarComponent />
      </div>
    </div>
  );
}
