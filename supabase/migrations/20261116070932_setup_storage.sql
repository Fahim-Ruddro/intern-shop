-- Create a public storage bucket named 'product-images'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true);

-- Allow public access so anyone can view the images on your website
CREATE POLICY "Give public access to product images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'product-images');