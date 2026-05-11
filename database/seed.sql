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
    ('Community Startup Expo', 'A local expo for startups, investors, and students.', '2026-08-05', 'Lalitpur', 0.00, 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80'),
    ('Wedding Expo Nepal', 'A curated showcase of planners, decorators, photographers, and premium wedding venues.', '2026-08-22', 'Bhaktapur', 35.00, 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80'),
    ('Himalayan Music Night', 'An outdoor evening concert featuring indie bands and acoustic performances.', '2026-09-12', 'Pokhara', 18.50, 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200&q=80'),
    ('Nepal Business Leadership Forum', 'A full-day forum for founders, executives, and innovators building the next generation of companies.', '2026-10-02', 'Kathmandu', 75.00, 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1200&q=80'),
    ('Festival Food Carnival', 'A family-friendly food festival with live stalls, entertainment, and local chef showcases.', '2026-10-18', 'Lalitpur', 12.00, 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80'),
    ('Creators and Freelancers Bootcamp', 'Hands-on sessions for creators, freelancers, and small agencies scaling their client work.', '2026-11-07', 'Biratnagar', 29.00, 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80'),
    ('Charity Gala Evening', 'A formal fundraising gala with dinner service, guest speakers, and entertainment.', '2026-12-05', 'Chitwan', 95.00, 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80')
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
