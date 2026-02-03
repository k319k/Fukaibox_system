/**
 * This file serves as a reference for the Supabase schema required for Tools App Data.
 * Since we are using Supabase Client directly for this, this is not necessarily used by Drizzle
 * in the main application flow, but documents the expected structure.
 * 
 * Table: tools_app_data
 */

/**
 * SQL Definition:
 * 
 * create table tools_app_data (
 *   id uuid primary key default gen_random_uuid(),
 *   app_id text not null,
 *   user_id text not null,
 *   collection text not null,
 *   data jsonb default '{}'::jsonb,
 *   is_public boolean default false,
 *   created_at timestamptz default now(),
 *   updated_at timestamptz default now(),
 *   
 *   unique(app_id, user_id, collection)
 * );
 * 
 * -- Enable RLS
 * alter table tools_app_data enable row level security;
 * 
 * -- Policy: Users can read/write their own data
 * create policy "Users can read their own data"
 *   on tools_app_data for select
 *   using (auth.uid() = user_id);
 * 
 * create policy "Users can insert their own data"
 *   on tools_app_data for insert
 *   with check (auth.uid() = user_id);
 * 
 * create policy "Users can update their own data"
 *   on tools_app_data for update
 *   using (auth.uid() = user_id);
 * 
 * -- Policy: Anyone can read public data
 * create policy "Public data is viewable by everyone"
 *   on tools_app_data for select
 *   using (is_public = true);
 */

export interface ToolsAppData {
    id: string;
    app_id: string;
    user_id: string;
    collection: string;
    data: any; // JSONB
    is_public: boolean;
    created_at: string;
    updated_at: string;
}
