-- Create the categories table
CREATE TABLE categories (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create the products table
CREATE TABLE products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  -- Price is stored as an integer (smallest unit, e.g., cents) as required for Stripe
  price integer NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  image text,
  created_at timestamptz DEFAULT now() NOT NULL
);