-- Add trigram index on description as well so searching description text is fast
CREATE INDEX IF NOT EXISTS idx_products_description_trgm ON products USING GIN (description gin_trgm_ops);

-- Helper function to normalize text (removes spaces, hyphens, underscores, lowercases)
-- Example: 'T-Shirts', 't shirts', and 'tshirts' all become 'tshirts'
CREATE OR REPLACE FUNCTION normalize_search_text(input TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN regexp_replace(lower(COALESCE(input, '')), '[^a-z0-9]+', '', 'g');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Search function matching product name, description, OR category name (both raw and normalized)
CREATE OR REPLACE FUNCTION search_product_ids(search_term TEXT)
RETURNS SETOF UUID AS $$
DECLARE
  clean_term TEXT := trim(COALESCE(search_term, ''));
  norm_term TEXT := normalize_search_text(clean_term);
BEGIN
  IF clean_term = '' THEN
    RETURN QUERY SELECT id FROM products;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT p.id
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
  WHERE
    p.name ILIKE '%' || clean_term || '%'
    OR p.description ILIKE '%' || clean_term || '%'
    OR c.name ILIKE '%' || clean_term || '%'
    OR (norm_term <> '' AND (
      normalize_search_text(p.name) LIKE '%' || norm_term || '%'
      OR normalize_search_text(c.name) LIKE '%' || norm_term || '%'
    ));
END;
$$ LANGUAGE plpgsql STABLE;