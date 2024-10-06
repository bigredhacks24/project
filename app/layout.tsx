import { EnvVarWarning } from "@/components/env-var-warning";
import HeaderAuth from "@/components/header";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Next.js and Supabase Starter Kit",
  description: "The fastest way to build apps with Next.js and Supabase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className} suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col items-center">
            <div className="flex-1 flex flex-col items-center">
              <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
                <div className="w-full flex justify-between items-center py-3 text-sm">
                  <div className="flex gap-5 items-center font-semibold">
                  </div>
                  {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
                </div>
              </nav>
            </div>

            <div className="flex-1 container mx-auto flex flex-col items-center w-full">
              <div className="flex flex-grow py-10 mb-12 w-full flex-col items-center">                 {/* bottom margin added to address footer overlap temporarily */}

                {children}
              </div>
              <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-sm gap-8 py-8">
                <p>
                  Created with 💖 by Temi Abedowale, Valerie Wong, Simon Ilincev, and Jasmine Li
                </p>
                <ThemeSwitcher />
              </footer>
            </div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}