-- Sample products to get started
-- Run this in the Supabase SQL editor after running the migration

insert into public.products (slug, name, description, price_cents, images, category, stock_qty) values
  (
    'rainbow-bunny-amigurumi',
    'Rainbow Bunny Amigurumi',
    'An adorable handmade bunny crocheted with soft rainbow yarn. Perfect as a gift or decoration. Approximately 6 inches tall. Comes with a polka-dot bow tie.',
    2800,
    array[]::text[],
    'Amigurumi',
    10
  ),
  (
    'pastel-tote-bag',
    'Pastel Dream Tote Bag',
    'A sturdy and stylish crochet tote bag in pastel colors. Made with durable cotton yarn, perfect for farmers markets or everyday use. Holds up to 10 lbs.',
    4500,
    array[]::text[],
    'Bags',
    5
  ),
  (
    'sunflower-beanie',
    'Sunflower Beanie',
    'Stay cozy in style with this cheerful sunflower beanie. Made with warm acrylic yarn, one-size-fits-most. Available in yellow, white, and pink.',
    2200,
    array[]::text[],
    'Hats',
    8
  ),
  (
    'strawberry-keychain',
    'Strawberry Keychain',
    'A tiny and cute crocheted strawberry keychain. Makes a wonderful gift or bag accessory. About 2 inches tall with a metal key ring.',
    800,
    array[]::text[],
    'Keychains',
    20
  ),
  (
    'cloud-pillow',
    'Fluffy Cloud Pillow',
    'A dreamy cloud-shaped pillow stuffed with soft polyfill. Perfect for a nursery or bedroom. Approximately 14 inches wide.',
    5500,
    array[]::text[],
    'Home Decor',
    4
  ),
  (
    'mini-cactus-set',
    'Mini Cactus Set (3-pack)',
    'Three adorable mini crochet cacti in terracotta pots. Each one is unique — no two are exactly alike! Great for desks or shelves.',
    3200,
    array[]::text[],
    'Amigurumi',
    7
  );
