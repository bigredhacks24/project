import { NextResponse, NextRequest } from "next/server";
import { pinata } from "@/utils/config";

async function getOrCreateEventGroup(eventId: string) {
    const groupName = `event_${eventId}_group`;
    let group;

    // Try to find an existing group
    const groups = await pinata.groups.list();
    group = groups.groups.find(g => g.name === groupName);

    if (!group) {
        // Create a new group if it doesn't exist
        group = await pinata.groups.create({
            name: groupName,
            isPublic: false
        });
    }

    return group.id;
}

export async function POST(request: NextRequest) {
    try {
        const eventId = request.nextUrl.searchParams.get('eventId');
        const isThumbnail = request.nextUrl.searchParams.get('thumbnail') === 'true';

        if (!eventId) {
            return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
        }

        const groupId = await getOrCreateEventGroup(eventId);

        const data = await request.formData();
        let file: File | null = data.get("file") as unknown as File;

        const uploadOptions = { groupId: groupId };
        if (isThumbnail) {
            // set the file name to 'thumbnail'
            // create new file object with new name
            file = new File([file], 'thumbnail', { type: file.type });
        }

        const uploadData = await pinata.upload.file(file, uploadOptions);

        const url = await pinata.gateways.createSignedURL({
            cid: uploadData.cid,
            expires: 3600,
        });

        return NextResponse.json({ url, cid: uploadData.cid, isThumbnail }, { status: 200 });
    } catch (e) {
        console.log(e);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const eventId = request.nextUrl.searchParams.get('eventId');
        if (!eventId) {
            return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
        }

        const groupId = await getOrCreateEventGroup(eventId);

        const { files } = await pinata.files.list().group(groupId);

        const fileUrls = await Promise.all(files.map(async (file) => {
            const url = await pinata.gateways.createSignedURL({
                cid: file.cid,
                expires: 3600,
            });
            return { url, cid: file.cid, isThumbnail: file.name === 'thumbnail' };
        }));

        return NextResponse.json(fileUrls, { status: 200 });
    } catch (e) {
        console.log(e);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
