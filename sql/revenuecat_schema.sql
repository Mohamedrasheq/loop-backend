-- Profiles table to store user subscription status
CREATE TABLE IF NOT EXISTS public.profiles (
    user_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    is_pro BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance (though user_id is PK)
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles (user_id);

-- Table to log all RevenueCat webhook events for auditing/debugging
CREATE TABLE IF NOT EXISTS public.revenuecat_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for searching events by user
CREATE INDEX IF NOT EXISTS revenuecat_events_user_id_idx ON public.revenuecat_events (user_id);
CREATE INDEX IF NOT EXISTS revenuecat_events_event_type_idx ON public.revenuecat_events (event_type);

-- Enable RLS (adjust as needed for your specific security model)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenuecat_events ENABLE ROW LEVEL SECURITY;

-- Note: You might need to add specific policies if the frontend needs to read this directly.
-- For now, we assume the backend (using service role) handles updates.
