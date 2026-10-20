-- ============================================================
-- Online Book Store - Seed Data
-- Run AFTER schema.sql
-- ============================================================

USE bookstore;

-- ------------------------------------------------------------
-- Users
-- Passwords below are bcrypt hashes.
--   admin@bookstore.com    -> Admin123!
--   customer@bookstore.com -> Customer123!
-- ------------------------------------------------------------
INSERT INTO users (name, email, password, role) VALUES
('Store Admin', 'admin@bookstore.com', '$2b$10$QoBp7DaUcyWs/vbbSb68g.gKI/Ji5kI8bq.yZScepleSi.xJeauv.', 'admin'),
('Jane Customer', 'customer@bookstore.com', '$2b$10$qWDTIGih5Vw0fJ6HcWeMmONCqnJupsIoXFGW7yYPnG/5C8VViKz8S', 'customer');

-- ------------------------------------------------------------
-- Categories
-- ------------------------------------------------------------
INSERT INTO categories (name) VALUES
('Fiction'),
('Non-Fiction'),
('Science'),
('Fantasy'),
('History'),
('Biography');

-- ------------------------------------------------------------
-- Books (category_id references the order inserted above: 1=Fiction,
-- 2=Non-Fiction, 3=Science, 4=Fantasy, 5=History, 6=Biography)
-- ------------------------------------------------------------
INSERT INTO books (title, author, price, description, category_id, stock) VALUES
('The Silent Orchard', 'Marina Voss', 14.99, 'A quiet town hides a decades-old secret in its orchard.', 1, 25),
('Paper Boats', 'Elena Marsh', 11.50, 'A coming-of-age story set along a river town.', 1, 18),
('The Glass Letters', 'Thomas Reyes', 13.25, 'Correspondence between two strangers reshapes both their lives.', 1, 12),
('Midnight Ferry', 'Aiko Tanaka', 15.75, 'A mystery unfolding aboard a night ferry crossing.', 1, 9),
('The Long Detour', 'Sam Whitfield', 12.00, 'A road-trip novel about grief and reconciliation.', 1, 20),
('Atomic Habits Explained', 'Derek Wallis', 18.99, 'A practical guide to building better daily habits.', 2, 30),
('Deep Focus', 'Priya Nair', 16.40, 'Strategies for concentration in a distracted world.', 2, 22),
('The Minimalist Kitchen', 'Carla Nguyen', 21.00, 'Simplify your cooking with fewer, better ingredients.', 2, 14),
('Talking to Strangers Again', 'Owen Blake', 17.25, 'Understanding communication across cultural divides.', 2, 16),
('Quantum Made Simple', 'Dr. Farah Hussain', 24.99, 'An accessible introduction to quantum mechanics.', 3, 11),
('The Genome Story', 'Dr. Alan Petrov', 22.50, 'How genetics reshaped modern medicine.', 3, 8),
('Climate in Motion', 'Dr. Lisa Cormier', 19.99, 'A data-driven look at climate systems and change.', 3, 17),
('The Shattered Crown', 'Rowan Ashford', 16.99, 'The first book in an epic fantasy trilogy about a broken kingdom.', 4, 27),
('Wolves of Ember Vale', 'Rowan Ashford', 17.99, 'The second book in the Ember Vale saga.', 4, 19),
('The Cartographer''s Curse', 'Nadia Storm', 15.50, 'A cursed map leads an apprentice mapmaker into danger.', 4, 13),
('Song of the Drowned City', 'Julian Kade', 18.25, 'A bard uncovers a sunken city''s forgotten magic.', 4, 6),
('Empires of Ash', 'Rowan Ashford', 19.50, 'A standalone fantasy epic of rival empires.', 4, 10),
('The Forgotten Treaty', 'Margaret Ellison', 20.00, 'How a single treaty reshaped a century of history.', 5, 15),
('Voices of the Uprising', 'Hassan Idris', 18.75, 'Oral histories from a pivotal revolution.', 5, 7),
('The Long Winter War', 'Erik Solheim', 21.25, 'A detailed account of a brutal winter military campaign.', 5, 9),
('A Life in Ink', 'Dorothy Vance', 16.00, 'The memoir of a celebrated but reclusive novelist.', 6, 14),
('Building the Impossible', 'Victor Chen', 23.00, 'The biography of a pioneering structural engineer.', 6, 5);

-- ------------------------------------------------------------
-- Carts (one empty cart for the seeded customer)
-- ------------------------------------------------------------
INSERT INTO carts (user_id) VALUES (2);
