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
