// Event Types
export interface Event {
  event_id: string;
  group_id: string;
  name: string;
  creation_timestamp: string; // ISO string for timestamp
  start_timestamp: string;
  end_timestamp: string;
}

export interface Group {
  group_id: string;
  name: string;
}

export interface EventAttendance {
  event: Event;
  group: Group;
  attending: boolean;
}

// Group Types
export interface Person {
  person_id: string;
  full_name: string;
  email: string;
}

export interface GroupDetails {
  group_id: string;
  name: string;
}

export interface GroupMembership {
  group: GroupDetails;
  person: Person;
}

// Friend Types
export interface Friend {
  person_id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  friends: string[] | null; // Array of person_id's representing the user's friends
}

export interface FriendListResponse {
  friends: Friend[];
}