-- Create user notification preferences table
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_assignments BOOLEAN NOT NULL DEFAULT TRUE,
  email_announcements BOOLEAN NOT NULL DEFAULT TRUE,
  email_messages BOOLEAN NOT NULL DEFAULT TRUE,
  email_reminders BOOLEAN NOT NULL DEFAULT TRUE,
  push_assignments BOOLEAN NOT NULL DEFAULT TRUE,
  push_announcements BOOLEAN NOT NULL DEFAULT TRUE,
  push_messages BOOLEAN NOT NULL DEFAULT TRUE,
  push_reminders BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add RLS policies
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own notification preferences
CREATE POLICY "Users can view their own notification preferences"
  ON user_notification_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy for users to update their own notification preferences
CREATE POLICY "Users can update their own notification preferences"
  ON user_notification_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy for users to insert their own notification preferences
CREATE POLICY "Users can insert their own notification preferences"
  ON user_notification_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Add function to handle updated_at
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at
CREATE TRIGGER update_notification_preferences_updated_at
BEFORE UPDATE ON user_notification_preferences
FOR EACH ROW
EXECUTE FUNCTION update_notification_preferences_updated_at(); 