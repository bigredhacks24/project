import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export async function signInWithGoogle(e: React.MouseEvent) {
	e.preventDefault();

	const { error } = await supabase.auth.signInWithOAuth({
		provider: "google",
		options: {
			redirectTo: `${window.location.origin}/auth/callback`,
		},
	});

	if (error) {
		console.error('Error signing in with Google:', error);
	}
}