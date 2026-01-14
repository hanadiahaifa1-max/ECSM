-- Create storage bucket for activity attachments
INSERT INTO storage.buckets (id, name, public) VALUES ('activity-attachments', 'activity-attachments', true);

-- Create RLS policies for activity attachments bucket
CREATE POLICY "Anyone can view activity attachments"
ON storage.objects FOR SELECT
USING (bucket_id = 'activity-attachments');

CREATE POLICY "Authenticated users can upload activity attachments"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'activity-attachments' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own activity attachments"
ON storage.objects FOR UPDATE
USING (bucket_id = 'activity-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own activity attachments"
ON storage.objects FOR DELETE
USING (bucket_id = 'activity-attachments' AND auth.uid()::text = (storage.foldername(name))[1]);