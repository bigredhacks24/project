import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
    const { members, name } = await request.json();

    if (!members || !Array.isArray(members) || !name) {
        return NextResponse.json({ error: "Invalid members array or missing group name" }, { status: 400 });
    }

    try {
        // Find groups that have exactly the given members
        const { data: groups, error } = await supabase
            .from("group")
            .select(`
                group_id,
                name,
                group_person!inner (person_id)
            `);

        if (error) throw error;

        // Filter groups to find one with exactly the given members
        const exactMatch = groups.find(group =>
            group.group_person.length === members.length &&
            group.group_person.every(gp =>
                members.includes(gp.person_id) ||
                members.some(member =>
                    (typeof member === 'object' && member.person_id === gp.person_id) ||
                    (typeof member === 'string' && member === gp.person_id)
                )
            )
        );

        if (exactMatch) {
            return NextResponse.json({ group: exactMatch, created: false });
        } else {
            // Create a new group if no exact match is found
            const { data: newGroup, error: createError } = await supabase
                .from("group")
                .insert({ name })
                .select()
                .single();

            if (createError) throw createError;

            // Add members to the new group
            const groupPersonEntries = members.map(personId => ({
                group_id: newGroup.group_id,
                person_id: typeof personId === 'string' ? personId : personId.person_id
            }));

            const { error: addMembersError } = await supabase
                .from("group_person")
                .insert(groupPersonEntries);

            if (addMembersError) throw addMembersError;

            return NextResponse.json({ group: newGroup, created: true });
        }
    } catch (error) {
        console.error("Error finding or creating group:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}