-- Add user_id to todos
ALTER TABLE todos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop old open policy
DROP POLICY IF EXISTS "Allow all" ON todos;

-- Only authenticated users can see/modify their own todos
CREATE POLICY "Users manage own todos"
  ON todos
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
