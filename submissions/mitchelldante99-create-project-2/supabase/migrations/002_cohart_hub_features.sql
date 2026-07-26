-- COHART HUB FEATURE PERMISSIONS
-- Safe update for an existing working Cohart Hub database.
-- IMPORTANT: This does NOT drop or replace is_channel_member().
-- Run after your existing schema is already working.

ALTER TABLE IF EXISTS public.messages
ENABLE ROW LEVEL SECURITY;

ALTER TABLE IF EXISTS public.notifications
ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS messages_update_own ON public.messages;
CREATE POLICY messages_update_own
ON public.messages
FOR UPDATE
TO authenticated
USING (auth.uid() = author_id)
WITH CHECK (auth.uid() = author_id);

DROP POLICY IF EXISTS messages_delete_own ON public.messages;
CREATE POLICY messages_delete_own
ON public.messages
FOR DELETE
TO authenticated
USING (auth.uid() = author_id);

DROP POLICY IF EXISTS notifications_read_own ON public.notifications;
CREATE POLICY notifications_read_own
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS notifications_update_own ON public.notifications;
CREATE POLICY notifications_update_own
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS notifications_insert_own ON public.notifications;
CREATE POLICY notifications_insert_own
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS notifications_delete_own ON public.notifications;
CREATE POLICY notifications_delete_own
ON public.notifications
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
