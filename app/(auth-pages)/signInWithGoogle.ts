import { createClient } from "@/utils/supabase/client";
const supabase = createClient();

export async function signInWithGoogle(e: unknown) {
    (e as MouseEvent).preventDefault();

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `https://bzojwpekxrzofzuzfonp.supabase.co/auth/v1/callback`,
        },
    });

    if (!error) {
        window.location.href = data.url;
    }
};