import { signOutAction } from "@/app/actions";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";

export default async function Header() {
  const {
    data: { user },
  } = await createClient().auth.getUser();

  return (
    <header className="w-full bg-white shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 w-screen">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="w-6 h-6 bg-gray-300 rounded-full mr-2"></div>
            <Link href="/" className="text-xl font-semibold text-gray-600">
              Big Red Hacks
            </Link>
          </div>
          {user ? (
            <nav className="flex items-center gap-6">
              <Link href="/memories" className="text-gray-600 hover:text-gray-900">
                Memories
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-gray-900">
                Profile
              </Link>
              <form action={signOutAction}>
                <Button type="submit" variant="default" size="sm">
                  Sign Out
                </Button>
              </form>
            </nav>
          ) : (
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild size="sm" variant="default">
                <Link href="/sign-up">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
