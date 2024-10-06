import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId");

    if (!groupId) {
        return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
    }

    console.log("We made it down here");

    try {
        // Get all members of the current group
        const { data: groupMembers, error: groupError } = await supabase
            .from("group_person")
            .select("person_id")
            .eq("group_id", groupId);

        if (groupError) throw groupError;

        const memberIds = groupMembers.map(m => m.person_id);

        // Get all groups that these members are part of
        const { data: relatedGroups, error: relatedGroupsError } = await supabase
            .from("group_person")
            .select("group_id")
            .in("person_id", memberIds);

        if (relatedGroupsError) throw relatedGroupsError;

        const relatedGroupIds = Array.from(new Set(relatedGroups.map(g => g.group_id)));

        // Get all members of these related groups
        const { data: potentialConnections, error: connectionsError } = await supabase
            .from("group_person")
            .select("person_id, group_id")
            .in("group_id", relatedGroupIds)
            .not("person_id", "in", `(${memberIds.join(",")})`);

        if (connectionsError) throw connectionsError;

        // Count occurrences of each potential connection
        const connectionCounts = potentialConnections.reduce((acc, curr) => {
            acc[curr.person_id] = (acc[curr.person_id] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Find the person(s) with the highest count
        const maxCount = Math.max(...Object.values(connectionCounts));
        const topConnectionIds = Object.keys(connectionCounts).filter(
            id => connectionCounts[id] === maxCount
        );

        // Randomly select one if there are multiple with the same count
        const selectedId = topConnectionIds[Math.floor(Math.random() * topConnectionIds.length)];

        // Fetch details of the selected person
        const { data: personDetails, error: personError } = await supabase
            .from("person")
            .select("person_id, full_name, email, profile_picture")
            .eq("person_id", selectedId)
            .single();

        if (personError) throw personError;

        return NextResponse.json({
            mostCommonConnection: {
                ...personDetails,
                connection_count: maxCount,
            },
        });
    } catch (error) {
        console.error("Error calculating second-degree connections:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}