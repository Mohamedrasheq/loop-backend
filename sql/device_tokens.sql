-- Device Tokens Table for Push Notifications
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS device_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE,
    push_token TEXT NOT NULL,
    device_token TEXT,
    platform TEXT DEFAULT 'unknown',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key with cascade to auto-delete tokens when a user is deleted
ALTER TABLE public.device_tokens
ADD CONSTRAINT fk_device_tokens_users
FOREIGN KEY (user_id) REFERENCES public.users(id)
ON DELETE CASCADE;

-- Index for fast lookups by user_id
CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id ON device_tokens(user_id);

-- Enable Row Level Security (optional, but recommended)
ALTER TABLE device_tokens ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read/write their own device tokens
CREATE POLICY "Users manage own device tokens"
    ON device_tokens
    FOR ALL
    USING (true)
    WITH CHECK (true);
