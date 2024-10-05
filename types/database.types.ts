export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      event: {
        Row: {
          creation_timestamp: string
          end_timestamp: string
          event_id: string
          group_id: string | null
          name: string
          start_timestamp: string
        }
        Insert: {
          creation_timestamp: string
          end_timestamp: string
          event_id?: string
          group_id?: string | null
          name: string
          start_timestamp: string
        }
        Update: {
          creation_timestamp?: string
          end_timestamp?: string
          event_id?: string
          group_id?: string | null
          name?: string
          start_timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group"
            referencedColumns: ["group_id"]
          },
        ]
      }
      event_person_attendance: {
        Row: {
          attending: boolean | null
          event_id: string
          person_id: string
        }
        Insert: {
          attending?: boolean | null
          event_id: string
          person_id: string
        }
        Update: {
          attending?: boolean | null
          event_id?: string
          person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_person_attendance_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event"
            referencedColumns: ["event_id"]
          },
          {
            foreignKeyName: "event_person_attendance_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["person_id"]
          },
        ]
      }
      group: {
        Row: {
          group_id: string
          name: string
        }
        Insert: {
          group_id?: string
          name: string
        }
        Update: {
          group_id?: string
          name?: string
        }
        Relationships: []
      }
      group_person: {
        Row: {
          group_id: string
          person_id: string
        }
        Insert: {
          group_id: string
          person_id: string
        }
        Update: {
          group_id?: string
          person_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_person_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group"
            referencedColumns: ["group_id"]
          },
          {
            foreignKeyName: "group_person_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "person"
            referencedColumns: ["person_id"]
          },
        ]
      }
      person: {
        Row: {
          email: string
          friends: string[] | null
          full_name: string | null
          person_id: string
          phone_number: string | null
          refresh_token: string | null
        }
        Insert: {
          email: string
          friends?: string[] | null
          full_name?: string | null
          person_id: string
          phone_number?: string | null
          refresh_token?: string | null
        }
        Update: {
          email?: string
          friends?: string[] | null
          full_name?: string | null
          person_id?: string
          phone_number?: string | null
          refresh_token?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
