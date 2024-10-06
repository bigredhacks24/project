import Link from "next/link";

// Inside the component's return statement, add this link
<Link
  href={`/groups/${params.id}/events`}
  className="text-blue-500 hover:underline"
>
  View Events
</Link>