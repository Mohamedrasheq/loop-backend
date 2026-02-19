-- Dedicated Notifications Table
-- Tracking history and status of all push notifications

CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    memory_item_id UUID REFERENCES memory_items(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'scheduled', -- 'scheduled', 'sent', 'failed'
    scheduled_message_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user history lookup
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);

-- Add foreign key with cascade to auto-delete notifications when a user is deleted
-- Note: Assuming public.users is your user table (e.g. synced from Clerk)
ALTER TABLE public.notifications
ADD CONSTRAINT fk_notifications_users
FOREIGN KEY (user_id) REFERENCES public.users(id)
ON DELETE CASCADE;

-- Enable Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Select - Users can read their own notifications
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (auth.uid()::text = user_id);

-- Policy: Insert - Backend usually handles this, but for RLS completeness:
CREATE POLICY "Users can insert own notifications"
    ON notifications FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

-- Policy: Update - Users can update their own notification status (e.g. marking read)
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

-- Policy: Delete - Users can delete their own notification history
CREATE POLICY "Users can delete own notifications"
    ON notifications FOR DELETE
    USING (auth.uid()::text = user_id);
