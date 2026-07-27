-- Run this in Supabase SQL Editor to allow our Mock User to chat!

-- 1. Remove the foreign key that requires a real Supabase Auth user
ALTER TABLE messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;

-- 2. Open up the security policies so unauthenticated users (our mock user) can read/write
DROP POLICY IF EXISTS "Allow public read access to channels" ON channels;
CREATE POLICY "Allow public read access to channels" ON channels FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow read messages in channels" ON messages;
CREATE POLICY "Allow read messages in channels" ON messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow insert messages" ON messages;
CREATE POLICY "Allow insert messages" ON messages FOR INSERT WITH CHECK (true);
