// Hand-written to match supabase/migrations until the project is linked, then
// replaced by `npm run db:types`. Keep it in the generator's shape.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      bills: {
        Row: {
          amount: number;
          category_id: string;
          category_type: Database["public"]["Enums"]["txn_type"];
          created_at: string;
          due_day: number | null;
          frequency: Database["public"]["Enums"]["bill_frequency"];
          id: string;
          is_active: boolean;
          name: string;
          next_due_date: string;
          note: string | null;
          payment_method: Database["public"]["Enums"]["payment_method"];
          user_id: string;
        };
        Insert: {
          amount: number;
          category_id: string;
          category_type?: Database["public"]["Enums"]["txn_type"];
          created_at?: string;
          due_day?: number | null;
          frequency?: Database["public"]["Enums"]["bill_frequency"];
          id?: string;
          is_active?: boolean;
          name: string;
          next_due_date: string;
          note?: string | null;
          payment_method?: Database["public"]["Enums"]["payment_method"];
          user_id?: string;
        };
        Update: {
          amount?: number;
          category_id?: string;
          category_type?: Database["public"]["Enums"]["txn_type"];
          created_at?: string;
          due_day?: number | null;
          frequency?: Database["public"]["Enums"]["bill_frequency"];
          id?: string;
          is_active?: boolean;
          name?: string;
          next_due_date?: string;
          note?: string | null;
          payment_method?: Database["public"]["Enums"]["payment_method"];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bills_category_type_fkey";
            columns: ["category_id", "category_type"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id", "type"];
          },
          {
            foreignKeyName: "bills_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          color: string;
          id: string;
          name: string;
          sort_order: number;
          type: Database["public"]["Enums"]["txn_type"];
          user_id: string | null;
        };
        Insert: {
          color: string;
          id?: string;
          name: string;
          sort_order?: number;
          type: Database["public"]["Enums"]["txn_type"];
          user_id?: string | null;
        };
        Update: {
          color?: string;
          id?: string;
          name?: string;
          sort_order?: number;
          type?: Database["public"]["Enums"]["txn_type"];
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "categories_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string;
          id: string;
          theme: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name: string;
          id: string;
          theme?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string;
          id?: string;
          theme?: string | null;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          amount: number;
          bill_id: string | null;
          category_id: string;
          created_at: string;
          id: string;
          name: string;
          note: string | null;
          occurred_on: string;
          payment_method: Database["public"]["Enums"]["payment_method"];
          type: Database["public"]["Enums"]["txn_type"];
          updated_at: string;
          user_id: string;
        };
        Insert: {
          amount: number;
          bill_id?: string | null;
          category_id: string;
          created_at?: string;
          id?: string;
          name: string;
          note?: string | null;
          occurred_on?: string;
          payment_method?: Database["public"]["Enums"]["payment_method"];
          type: Database["public"]["Enums"]["txn_type"];
          updated_at?: string;
          user_id?: string;
        };
        Update: {
          amount?: number;
          bill_id?: string | null;
          category_id?: string;
          created_at?: string;
          id?: string;
          name?: string;
          note?: string | null;
          occurred_on?: string;
          payment_method?: Database["public"]["Enums"]["payment_method"];
          type?: Database["public"]["Enums"]["txn_type"];
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_bill_id_fkey";
            columns: ["bill_id"];
            isOneToOne: false;
            referencedRelation: "bills";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "transactions_category_type_fkey";
            columns: ["category_id", "type"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id", "type"];
          },
          {
            foreignKeyName: "transactions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      delete_all_transactions: {
        Args: never;
        Returns: number;
      };
      get_period_summary: {
        Args: { end?: string; start?: string };
        Returns: Json;
      };
      pay_bill: {
        Args: { amount: number; bill_id: string; paid_on: string };
        Returns: Database["public"]["Tables"]["transactions"]["Row"];
      };
    };
    Enums: {
      bill_frequency: "once" | "weekly" | "monthly" | "yearly";
      payment_method: "cash" | "gcash" | "bdo" | "maribank";
      txn_type: "income" | "expense";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
