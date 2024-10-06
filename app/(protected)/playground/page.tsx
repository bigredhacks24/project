"use client";

import { InfoIcon } from "lucide-react";
import GoogleCalendarComponent from "@/components/GoogleCalendarComponent";
import FileUploadForm from "@/components/file-upload-form";
import { useState, useEffect } from "react";
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';
import Spinner from "@/components/Spinner";

interface UploadedFile {
  url: string;
  cid: string;
}

export default function PlaygroundPage() {
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
    return <Spinner />;
  }

  if (error || !user) {
    return <div>Error: {error || 'User not found'}</div>;
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated
          user
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

      <div>
        <h2 className="font-bold text-2xl mb-4">Google Calendar Integration</h2>
        <GoogleCalendarComponent />
      </div>
    </div>
  );
}
