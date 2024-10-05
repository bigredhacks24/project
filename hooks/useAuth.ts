import { useState, useEffect } from 'react';
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export function useAuth() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                // @ts-ignore
                setUser(session?.user ?? null);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    return { user };
}