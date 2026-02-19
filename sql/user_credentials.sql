-- User Credentials Table
-- Per-user encrypted credential storage for third-party service integrations
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS user_credentials (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    service TEXT NOT NULL,                    -- 'github', 'linear', 'gmail', 'slack', etc.
    encrypted_credentials TEXT NOT NULL,       -- AES-256-GCM encrypted JSON
    iv TEXT NOT NULL,                          -- Initialization vector (hex)
    auth_tag TEXT NOT NULL,                    -- Authentication tag (hex)
    metadata JSONB DEFAULT '{}',              -- Non-sensitive display info (username, email, etc.)
    connected_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, service)                  -- One credential per service per user
);

-- Foreign key with cascade to auto-delete credentials when user is deleted
ALTER TABLE public.user_credentials
ADD CONSTRAINT fk_user_credentials_users
FOREIGN KEY (user_id) REFERENCES public.users(id)
ON DELETE CASCADE;

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_credentials_user_id ON user_credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_user_credentials_user_service ON user_credentials(user_id, service);

-- Enable Row Level Security
ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;

-- Policy: Backend service role manages all credentials
CREATE POLICY "Service role manages credentials"
    ON user_credentials
    FOR ALL
    USING (true)
    WITH CHECK (true);
