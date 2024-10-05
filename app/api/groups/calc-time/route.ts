import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

type TimeBlock = {
  start: Date;
  end: Date;
};

async function fetchUserAvailability(
  userId: string
): Promise<{ [key: string]: TimeBlock[] }> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_URL}/api/calendar-data/date?userId=${userId}`
  );
  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  // Convert TimeBlock dates to EST timezone
  const freePeriods: { [key: string]: TimeBlock[] } = {};
  for (const [day, periods] of Object.entries(data.freePeriods) as [
    string,
    TimeBlock[],
  ][]) {
    freePeriods[day] = periods.map((period: TimeBlock) => ({
      start: adjustToEST(new Date(period.start)),
      end: adjustToEST(new Date(period.end)),
    }));
  }
  return freePeriods;
}

function adjustToEST(date: Date): Date {
  const tmp = new Date(date);
  return new Date(tmp.getTime() - new Date().getTimezoneOffset() * 60000);
}

// Fetch and calculate available times for everyone in a group
export async function GET(req: Request) {
  const supabase = createClient();
  const url = new URL(req.url);
  const groupId = url.searchParams.get("groupId");

  if (!groupId) {
    return NextResponse.json(
      { error: "groupId query parameter is required" },
      { status: 400 }
    );
  }

  // Fetch group members
  const { data: groupMembers, error: groupMembersError } = await supabase
    .from("group_person")
    .select("person_id")
    .eq("group_id", groupId);

  if (groupMembersError) {
    return NextResponse.json(
      { error: groupMembersError.message },
      { status: 500 }
    );
  }

  // Fetch availability for each member
  const availabilityPromises = groupMembers.map((member) =>
    fetchUserAvailability(member.person_id)
  );

  try {
    const availabilities = await Promise.all(availabilityPromises);

    // Log available times for debugging
    console.log("Available times for each calendar:");
    availabilities.forEach((availability, index) => {
      console.log(`Calendar ${index + 1}:`, availability);
    });

    // Calculate common available times
    const commonAvailability = calculateCommonAvailability(availabilities);

    return NextResponse.json({ commonAvailability }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

function calculateCommonAvailability(
  availabilities: { [key: string]: TimeBlock[] }[]
) {
  const commonAvailability: { [day: string]: TimeBlock[] } = {};

  availabilities.forEach((availability) => {
    Object.entries(availability).forEach(([day, timeBlocks]) => {
      if (!commonAvailability[day]) {
        commonAvailability[day] = timeBlocks;
      } else {
        commonAvailability[day] = intersectTimeBlocks(
          commonAvailability[day],
          timeBlocks
        );
      }
    });
  });

  return commonAvailability;
}

function intersectTimeBlocks(
  blocks1: TimeBlock[],
  blocks2: TimeBlock[]
): TimeBlock[] {
  const result: TimeBlock[] = [];

  blocks1.forEach((block1) => {
    blocks2.forEach((block2) => {
      const start = new Date(
        Math.max(block1.start.getTime(), block2.start.getTime())
      );
      const end = new Date(
        Math.min(block1.end.getTime(), block2.end.getTime())
      );

      if (start < end) {
        result.push({ start, end });
      }
    });
  });

  return result;
}

function formatTimeBlock(timeBlock: TimeBlock): { start: string; end: string } {
  return {
    start: timeBlock.start.toISOString(),
    end: timeBlock.end.toISOString(),
  };
}
