USE event_management_system;

-- Admin login : admin@gmail.com / admin123
-- User login  : user@gmail.com  / user12345

INSERT INTO users (name, email, password, role)
VALUES
    ('Admin User', 'admin@gmail.com', '$2y$10$3TUJ7d.ge78QU/875SIpy.OJBkYNVJ5ijPxq8RTp5CI6ukMww1gza', 'admin'),
    ('Sample User', 'user@gmail.com',  '$2y$10$Jv3xxcZnoteaNznk58pMwORccXHMjfzYTkYZLJAWOJfzwQ/nsRQOm', 'user')
ON DUPLICATE KEY UPDATE
    name     = VALUES(name),
    password = VALUES(password),
    role     = VALUES(role);

INSERT INTO events (title, description, date, location, price, image)
VALUES
    ('Tech Summit 2026', 'A one-day conference focused on product engineering, AI workflows, and startup leadership.', '2026-06-18', 'Kathmandu', 49.99, 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80'),
    ('Design Leaders Meetup', 'An evening meetup for designers, founders, and front-end engineers.', '2026-07-10', 'Pokhara', 25.00, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80'),
    ('Community Startup Expo', 'A local expo for startups, investors, and students.', '2026-08-05', 'Lalitpur', 0.00, 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80')
ON DUPLICATE KEY UPDATE
    description = VALUES(description),
    date        = VALUES(date),
    location    = VALUES(location),
    price       = VALUES(price),
    image       = VALUES(image);

INSERT IGNORE INTO bookings (user_id, event_id)
VALUES (
    (SELECT id FROM users WHERE email = 'user@gmail.com'),
    (SELECT id FROM events WHERE title = 'Tech Summit 2026')
);
