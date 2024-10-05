import NextLogo from "./next-logo";
import SupabaseLogo from "./supabase-logo";
import AuthButton from "./header";

export default function Header() {
  return (
    <div className="flex flex-col gap-16 items-center">
      <div className="flex gap-8 justify-between items-center w-full">
        <div className="flex gap-5 items-center font-semibold">
          {/* Other logo or title elements */}
        </div>
      </div>
      <div className="w-full p-[1px] bg-gradient-to-r from-transparent via-foreground/10 to-transparent my-8" />
    </div>
  );
}
