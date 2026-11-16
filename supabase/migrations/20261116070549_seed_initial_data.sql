-- 1. Insert 6 Categories
INSERT INTO categories (id, name, slug) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'T-Shirts', 't-shirts'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Hoodies', 'hoodies'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Accessories', 'accessories'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Mugs', 'mugs'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Stickers', 'stickers'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Posters', 'posters');

-- 2. Insert 30 Products (5 per category)
-- Prices are in cents (e.g., 2500 = $25.00)
INSERT INTO products (category_id, name, slug, description, price, stock, image) VALUES
-- T-Shirts
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Classic Logo Tee', 'classic-logo-tee', '100% cotton classic logo t-shirt.', 2500, 50, 'classic-tee.jpg'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Vintage Wash Tee', 'vintage-wash-tee', 'Soft vintage wash t-shirt.', 2800, 30, 'vintage-tee.jpg'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Developer Graphic Tee', 'dev-graphic-tee', 'Funny developer graphic tee.', 2200, 10, 'dev-tee.jpg'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Minimalist Pocket Tee', 'minimalist-pocket-tee', 'Clean pocket tee.', 2600, 100, 'pocket-tee.jpg'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Long Sleeve Tee', 'long-sleeve-tee', 'Perfect for autumn.', 3000, 40, 'long-sleeve.jpg'),

-- Hoodies
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Cozy Fleece Hoodie', 'cozy-fleece-hoodie', 'Extremely warm hoodie.', 5500, 20, 'cozy-hoodie.jpg'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Zip-Up Tech Hoodie', 'zip-up-tech-hoodie', 'Lightweight zip-up.', 6000, 15, 'zip-hoodie.jpg'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Oversized Streetwear Hoodie', 'oversized-streetwear-hoodie', 'Baggy fit for comfort.', 6500, 5, 'oversized-hoodie.jpg'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Heavyweight Pullover', 'heavyweight-pullover', 'Durable heavyweight cotton.', 7000, 25, 'heavy-pullover.jpg'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'Embroidered Logo Hoodie', 'embroidered-logo-hoodie', 'Premium embroidered logo.', 6800, 30, 'embroidered-hoodie.jpg'),

-- Accessories
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Canvas Tote Bag', 'canvas-tote-bag', 'Eco-friendly shopping bag.', 1500, 200, 'tote-bag.jpg'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Dad Hat', 'dad-hat', 'Adjustable strap dad hat.', 2000, 45, 'dad-hat.jpg'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Beanie', 'beanie', 'Winter knit beanie.', 1800, 60, 'beanie.jpg'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Enamel Pin', 'enamel-pin', 'Cool backpack pin.', 800, 300, 'enamel-pin.jpg'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'Lanyard', 'lanyard', 'Key and badge holder.', 1000, 150, 'lanyard.jpg'),

-- Mugs
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Ceramic Coffee Mug', 'ceramic-coffee-mug', 'Standard 11oz mug.', 1200, 80, 'ceramic-mug.jpg'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Travel Tumbler', 'travel-tumbler', 'Insulated hot/cold tumbler.', 2500, 40, 'travel-tumbler.jpg'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Enamel Camp Mug', 'enamel-camp-mug', 'Durable metal camp mug.', 1500, 50, 'camp-mug.jpg'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Color Changing Mug', 'color-changing-mug', 'Changes color when hot.', 1800, 20, 'magic-mug.jpg'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a14', 'Giant 15oz Mug', 'giant-15oz-mug', 'For serious coffee drinkers.', 1600, 35, 'giant-mug.jpg'),

-- Stickers
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Logo Die-Cut Sticker', 'logo-die-cut-sticker', 'Waterproof laptop sticker.', 300, 500, 'logo-sticker.jpg'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Holographic Sticker', 'holographic-sticker', 'Shiny holographic design.', 400, 400, 'holo-sticker.jpg'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Developer Joke Sticker', 'dev-joke-sticker', '404 sleep not found.', 350, 300, 'dev-sticker.jpg'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Bumper Sticker', 'bumper-sticker', 'Durable car sticker.', 500, 100, 'bumper-sticker.jpg'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a15', 'Sticker Pack (Set of 5)', 'sticker-pack-5', 'Bundle of our best stickers.', 1200, 50, 'sticker-pack.jpg'),

-- Posters
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Minimalist Art Poster', 'minimalist-art-poster', '18x24 wall art.', 2000, 40, 'art-poster.jpg'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Code Syntax Poster', 'code-syntax-poster', 'Cheat sheet for your wall.', 1800, 60, 'syntax-poster.jpg'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Inspirational Quote Poster', 'inspirational-quote-poster', 'Keep pushing forward.', 1500, 80, 'quote-poster.jpg'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Vintage Tech Ad Poster', 'vintage-tech-ad-poster', 'Retro computer aesthetic.', 2200, 25, 'retro-poster.jpg'),
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a16', 'Framed Office Print', 'framed-office-print', 'Comes with a basic frame.', 4500, 15, 'framed-poster.jpg');