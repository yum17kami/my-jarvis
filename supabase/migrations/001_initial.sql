-- Enable pgvector extension
create extension if not exists vector;

-- Profiles (extends Supabase auth.users)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  display_name text,
  created_at timestamptz default now() not null
);

-- Conversations
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text default '新しい会話',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text check (role in ('user', 'assistant')) not null,
  content text not null,
  created_at timestamptz default now() not null
);

-- Memories (extracted facts/values/patterns with vector embeddings)
create table if not exists memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category text check (category in ('fact', 'value', 'pattern', 'goal', 'preference', 'emotion')) not null,
  content text not null,
  embedding vector(1536),
  source_message_id uuid references messages(id) on delete set null,
  confidence float default 0.7 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Hypotheses (user understanding with confidence levels)
create table if not exists hypotheses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null,
  statement text not null,
  confidence float default 0.5 not null,
  evidence_count int default 1 not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable Row Level Security
alter table profiles enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table memories enable row level security;
alter table hypotheses enable row level security;

-- Profiles policies
create policy "Users can manage own profile"
  on profiles for all using (auth.uid() = id);

-- Conversations policies
create policy "Users can manage own conversations"
  on conversations for all using (auth.uid() = user_id);

-- Messages policies
create policy "Users can manage own messages"
  on messages for all using (auth.uid() = user_id);

-- Memories policies
create policy "Users can manage own memories"
  on memories for all using (auth.uid() = user_id);

-- Hypotheses policies
create policy "Users can manage own hypotheses"
  on hypotheses for all using (auth.uid() = user_id);

-- Vector similarity search function
create or replace function search_memories(
  query_embedding vector(1536),
  user_id_param uuid,
  match_count int default 5
)
returns table (
  id uuid,
  category text,
  content text,
  confidence float,
  similarity float
)
language plpgsql
as $$
begin
  return query
    select
      m.id,
      m.category,
      m.content,
      m.confidence,
      1 - (m.embedding <=> query_embedding) as similarity
    from memories m
    where m.user_id = user_id_param
      and m.embedding is not null
    order by m.embedding <=> query_embedding
    limit match_count;
end;
$$;

-- Auto-create profile on user signup
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
