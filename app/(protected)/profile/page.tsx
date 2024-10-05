'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import Spinner from "@/components/Spinner";

type Person = Database['public']['Tables']['person']['Row'];

export default function ProfilePage() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Person | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        const fetchUserAndProfile = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);

                if (user) {
                    const { data, error } = await supabase
                        .from('person')
                        .select('*')
                        .eq('person_id', user.id)
                        .single();

                    if (error) throw error;
                    setProfile(data);
                }
            } catch (err) {
                console.error(err);
                setError('Failed to fetch user data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserAndProfile();
    }, []);

    const handleProfileUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (user) {
                const { error } = await supabase
                    .from('person')
                    .update({
                        full_name: profile?.full_name,
                        phone_number: profile?.phone_number,
                    })
                    .eq('person_id', user?.id);

                if (error) throw error;
            }
        } catch (err) {
            console.error(err);
            setError('Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleCalendarAuth = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/google-auth');
            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('Authentication URL not received');
            }
        } catch (err) {
            setError('Failed to initiate Google Calendar authentication');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) return <Spinner />;
    if (!user || !profile) return <div>No user data found</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <Card className="w-[800px] mx-auto">
            <CardHeader>
                <CardTitle>Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={user.email || ''} disabled />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name</Label>
                        <Input
                            id="fullName"
                            value={profile.full_name || ''}
                            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                            id="phoneNumber"
                            placeholder="(607) 200-0000"
                            value={profile.phone_number || ''}
                            onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                        />
                    </div>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Updating...' : 'Update Profile'}
                    </Button>
                </form>

                <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">Google Calendar Integration</h3>
                    <Button onClick={handleGoogleCalendarAuth} disabled={isLoading}>
                        {profile.refresh_token ? 'Reconnect Google Calendar' : 'Connect Google Calendar'}
                    </Button>
                    {profile.refresh_token && (
                        <p className="mt-2 text-sm text-green-600">Google Calendar is connected!</p>
                    )}
                    {!profile.refresh_token && (
                        <p className="mt-2 text-sm text-red-600">You must connect Google Calendar to use our app!</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}