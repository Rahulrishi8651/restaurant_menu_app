-- ============================================================
-- RestaurantOS — Sample Seed Data
-- ============================================================

-- Admin user (password: Admin@123)
INSERT INTO users (id, name, email, password, role) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Restaurant Admin',
  'admin@restaurantos.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Admin@123
  'admin'
);

-- Sample customers (password: User@123 for all)
INSERT INTO users (id, name, email, password, phone, address) VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Priya Sharma', 'priya@example.com',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
   '9876543210', '12 MG Road, Bangalore'),
  ('b0000000-0000-0000-0000-000000000002', 'Arjun Mehta', 'arjun@example.com',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
   '9876543211', '45 Indiranagar, Bangalore'),
  ('b0000000-0000-0000-0000-000000000003', 'Kavya Reddy', 'kavya@example.com',
   '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
   '9876543212', '78 Koramangala, Bangalore');

-- ============================================================
-- CATEGORIES
-- ============================================================
INSERT INTO categories (name, slug, icon, display_order) VALUES
  ('Starters',    'starters',    '🥗', 1),
  ('Main Course', 'main-course', '🍛', 2),
  ('Biryani',     'biryani',     '🍚', 3),
  ('Pizza',       'pizza',       '🍕', 4),
  ('Burgers',     'burgers',     '🍔', 5),
  ('Desserts',    'desserts',    '🍮', 6),
  ('Beverages',   'beverages',   '🥤', 7);

-- ============================================================
-- MENU ITEMS
-- ============================================================
INSERT INTO menu_items (id, category_id, name, slug, description, price, cost_price, is_veg, is_featured, spice_level, prep_time_min, calories, tags, rating, rating_count) VALUES

-- STARTERS
('c0000001-0000-0000-0000-000000000001', 1, 'Paneer Tikka', 'paneer-tikka',
 'Soft cottage cheese marinated in spiced yogurt, grilled in tandoor to perfection.',
 280, 120, TRUE, TRUE, 2, 20, 320, ARRAY['bestseller', 'vegetarian'], 4.5, 128),

('c0000001-0000-0000-0000-000000000002', 1, 'Chicken 65', 'chicken-65',
 'Deep fried chicken tossed with aromatic spices, curry leaves and green chillies.',
 320, 140, FALSE, FALSE, 3, 15, 420, ARRAY['spicy', 'crispy'], 4.3, 95),

('c0000001-0000-0000-0000-000000000003', 1, 'Veg Spring Rolls', 'veg-spring-rolls',
 'Crispy rolls stuffed with cabbage, carrots, and glass noodles. Served with sweet chilli sauce.',
 220, 80, TRUE, FALSE, 1, 10, 280, ARRAY['crispy', 'vegetarian'], 4.1, 67),

('c0000001-0000-0000-0000-000000000004', 1, 'Seekh Kebab', 'seekh-kebab',
 'Minced mutton mixed with fresh herbs and spices, skewered and grilled over charcoal.',
 380, 180, FALSE, TRUE, 2, 25, 450, ARRAY['bestseller', 'grilled'], 4.6, 142),

-- MAIN COURSE
('c0000002-0000-0000-0000-000000000001', 2, 'Butter Chicken', 'butter-chicken',
 'Tender chicken in a rich, creamy tomato-based gravy with aromatic spices.',
 380, 160, FALSE, TRUE, 1, 25, 520, ARRAY['bestseller', 'creamy'], 4.8, 256),

('c0000002-0000-0000-0000-000000000002', 2, 'Dal Makhani', 'dal-makhani',
 'Slow-cooked black lentils simmered overnight with butter, cream and tomatoes.',
 260, 80, TRUE, FALSE, 1, 30, 380, ARRAY['vegetarian', 'classic'], 4.4, 89),

('c0000002-0000-0000-0000-000000000003', 2, 'Palak Paneer', 'palak-paneer',
 'Fresh cottage cheese cubes in a smooth, spiced spinach gravy.',
 300, 100, TRUE, FALSE, 1, 20, 340, ARRAY['vegetarian', 'healthy'], 4.2, 74),

('c0000002-0000-0000-0000-000000000004', 2, 'Rogan Josh', 'rogan-josh',
 'Authentic Kashmiri slow-cooked lamb with whole spices and Kashmiri chilli.',
 450, 200, FALSE, FALSE, 2, 40, 560, ARRAY['premium', 'slow-cooked'], 4.7, 110),

-- BIRYANI
('c0000003-0000-0000-0000-000000000001', 3, 'Hyderabadi Chicken Biryani', 'hyderabadi-chicken-biryani',
 'Authentic dum biryani with marinated chicken, fragrant basmati rice and caramelized onions.',
 420, 180, FALSE, TRUE, 2, 35, 680, ARRAY['bestseller', 'dum-cooked'], 4.9, 389),

('c0000003-0000-0000-0000-000000000002', 3, 'Veg Biryani', 'veg-biryani',
 'Aromatic basmati rice cooked with seasonal vegetables and whole spices.',
 320, 100, TRUE, FALSE, 1, 30, 520, ARRAY['vegetarian'], 4.2, 134),

('c0000003-0000-0000-0000-000000000003', 3, 'Mutton Biryani', 'mutton-biryani',
 'Slow-cooked tender mutton with saffron-infused basmati rice. A royal treat.',
 520, 240, FALSE, FALSE, 2, 45, 750, ARRAY['premium', 'slow-cooked'], 4.7, 198),

-- PIZZA
('c0000004-0000-0000-0000-000000000001', 4, 'Margherita Pizza', 'margherita-pizza',
 'Classic Italian pizza with San Marzano tomato sauce, fresh mozzarella, and basil.',
 350, 120, TRUE, FALSE, 0, 20, 620, ARRAY['classic', 'vegetarian'], 4.3, 87),

('c0000004-0000-0000-0000-000000000002', 4, 'Chicken BBQ Pizza', 'chicken-bbq-pizza',
 'Smoky BBQ base, grilled chicken, red onions, peppers and mozzarella.',
 420, 160, FALSE, TRUE, 1, 22, 780, ARRAY['bestseller', 'cheesy'], 4.5, 165),

('c0000004-0000-0000-0000-000000000003', 4, 'Peri Peri Veggie Pizza', 'peri-peri-veggie-pizza',
 'Spicy peri peri sauce with mix of bell peppers, jalapenos, olives and corn.',
 380, 130, TRUE, FALSE, 2, 20, 640, ARRAY['spicy', 'vegetarian'], 4.1, 62),

-- BURGERS
('c0000005-0000-0000-0000-000000000001', 5, 'Classic Smash Burger', 'classic-smash-burger',
 'Double smashed beef patty, American cheese, pickles, mustard and ketchup.',
 320, 130, FALSE, TRUE, 0, 15, 720, ARRAY['bestseller', 'juicy'], 4.6, 203),

('c0000005-0000-0000-0000-000000000002', 5, 'Crispy Chicken Burger', 'crispy-chicken-burger',
 'Buttermilk fried chicken fillet, coleslaw, pickles and sriracha mayo.',
 300, 120, FALSE, FALSE, 1, 15, 660, ARRAY['crispy', 'popular'], 4.4, 156),

('c0000005-0000-0000-0000-000000000003', 5, 'Veggie Supreme Burger', 'veggie-supreme-burger',
 'Beetroot and black bean patty, avocado, lettuce, tomato and chipotle sauce.',
 280, 100, TRUE, FALSE, 0, 15, 540, ARRAY['vegetarian', 'healthy'], 4.0, 48),

-- DESSERTS
('c0000006-0000-0000-0000-000000000001', 6, 'Gulab Jamun', 'gulab-jamun',
 'Soft milk-solid dumplings soaked in rose-flavored sugar syrup. Served warm.',
 160, 50, TRUE, FALSE, 0, 10, 380, ARRAY['classic', 'sweet'], 4.6, 178),

('c0000006-0000-0000-0000-000000000002', 6, 'Chocolate Lava Cake', 'chocolate-lava-cake',
 'Warm dark chocolate cake with a molten gooey centre, served with vanilla ice cream.',
 280, 90, TRUE, TRUE, 0, 15, 520, ARRAY['bestseller', 'chocolate'], 4.8, 234),

('c0000006-0000-0000-0000-000000000003', 6, 'Mango Kulfi', 'mango-kulfi',
 'Traditional Indian ice cream made with reduced milk and fresh Alphonso mangoes.',
 180, 60, TRUE, FALSE, 0, 5, 280, ARRAY['seasonal', 'traditional'], 4.4, 92),

-- BEVERAGES
('c0000007-0000-0000-0000-000000000001', 7, 'Mango Lassi', 'mango-lassi',
 'Thick and creamy yogurt-based drink blended with fresh mangoes and a hint of cardamom.',
 140, 40, TRUE, FALSE, 0, 5, 220, ARRAY['refreshing', 'classic'], 4.5, 145),

('c0000007-0000-0000-0000-000000000002', 7, 'Fresh Lime Soda', 'fresh-lime-soda',
 'Freshly squeezed lime with soda, choice of sweet, salted or masala.',
 80, 20, TRUE, FALSE, 0, 3, 60, ARRAY['refreshing'], 4.3, 89),

('c0000007-0000-0000-0000-000000000003', 7, 'Cold Coffee', 'cold-coffee',
 'Freshly brewed strong coffee blended with chilled milk and ice cream.',
 180, 50, TRUE, FALSE, 0, 5, 280, ARRAY['caffeinated', 'creamy'], 4.4, 112);

-- ============================================================
-- SAMPLE ORDERS
-- ============================================================
INSERT INTO orders (id, user_id, order_number, status, subtotal, tax_amount, delivery_fee, total_amount, delivery_address, delivery_name, delivery_phone, payment_method, payment_status, created_at) VALUES
  ('d0000001-0000-0000-0000-000000000001',
   'b0000000-0000-0000-0000-000000000001',
   'ORD-20240312-1001', 'delivered', 800, 40, 30, 870,
   '12 MG Road, Bangalore', 'Priya Sharma', '9876543210', 'cod', 'paid',
   NOW() - INTERVAL '2 days'),

  ('d0000001-0000-0000-0000-000000000002',
   'b0000000-0000-0000-0000-000000000002',
   'ORD-20240312-1002', 'preparing', 700, 35, 30, 765,
   '45 Indiranagar, Bangalore', 'Arjun Mehta', '9876543211', 'razorpay', 'paid',
   NOW() - INTERVAL '1 hour'),

  ('d0000001-0000-0000-0000-000000000003',
   'b0000000-0000-0000-0000-000000000003',
   'ORD-20240312-1003', 'out_for_delivery', 420, 21, 30, 471,
   '78 Koramangala, Bangalore', 'Kavya Reddy', '9876543212', 'cod', 'pending',
   NOW() - INTERVAL '30 minutes');

-- Order items
INSERT INTO order_items (order_id, menu_item_id, item_name, unit_price, quantity, subtotal) VALUES
  ('d0000001-0000-0000-0000-000000000001', 'c0000002-0000-0000-0000-000000000001', 'Butter Chicken', 380, 1, 380),
  ('d0000001-0000-0000-0000-000000000001', 'c0000003-0000-0000-0000-000000000001', 'Hyderabadi Chicken Biryani', 420, 1, 420),
  ('d0000001-0000-0000-0000-000000000002', 'c0000004-0000-0000-0000-000000000002', 'Chicken BBQ Pizza', 420, 1, 420),
  ('d0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', 'Paneer Tikka', 280, 1, 280),
  ('d0000001-0000-0000-0000-000000000003', 'c0000003-0000-0000-0000-000000000001', 'Hyderabadi Chicken Biryani', 420, 1, 420);

-- Order status history
INSERT INTO order_status_history (order_id, status, note) VALUES
  ('d0000001-0000-0000-0000-000000000001', 'pending', 'Order received'),
  ('d0000001-0000-0000-0000-000000000001', 'confirmed', 'Order confirmed by restaurant'),
  ('d0000001-0000-0000-0000-000000000001', 'preparing', 'Chef started preparing'),
  ('d0000001-0000-0000-0000-000000000001', 'out_for_delivery', 'Out for delivery'),
  ('d0000001-0000-0000-0000-000000000001', 'delivered', 'Delivered successfully'),
  ('d0000001-0000-0000-0000-000000000002', 'pending', 'Order received'),
  ('d0000001-0000-0000-0000-000000000002', 'confirmed', 'Order confirmed'),
  ('d0000001-0000-0000-0000-000000000002', 'preparing', 'Chef started preparing'),
  ('d0000001-0000-0000-0000-000000000003', 'pending', 'Order received'),
  ('d0000001-0000-0000-0000-000000000003', 'confirmed', 'Order confirmed'),
  ('d0000001-0000-0000-0000-000000000003', 'preparing', 'Chef started preparing'),
  ('d0000001-0000-0000-0000-000000000003', 'out_for_delivery', 'Out for delivery with driver Rajan');
