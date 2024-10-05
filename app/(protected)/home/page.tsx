import { InfoIcon } from "lucide-react";
import GoogleCalendarComponent from "@/components/GoogleCalendarComponent";

export default async function ProtectedPage({ user }: { user: any; }) {
  return (
    <>
      <div className="flex-1 w-full flex flex-col gap-12">
        <div className="w-full">
          <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
            <InfoIcon size="16" strokeWidth={2} />
            This is a protected page that you can only see as an authenticated
            user
          </div>
        </div>
      </div>
      <div>
        <h2 className="font-bold text-2xl mb-4">Google Calendar Integration</h2>
        <GoogleCalendarComponent />
      </div>
    </>
  );
}
