USE event_management_system;

-- Admin login : admin@gmail.com / admin123
-- User login  : user@gmail.com  / user12345

INSERT INTO users (name, email, password, role, is_verified, verified_at, otp_code_hash, otp_expires_at, otp_last_sent_at)
VALUES
    ('Admin User', 'admin@gmail.com', '$2y$10$3TUJ7d.ge78QU/875SIpy.OJBkYNVJ5ijPxq8RTp5CI6ukMww1gza', 'admin', 1, NOW(), NULL, NULL, NULL),
    ('Sample User', 'user@gmail.com',  '$2y$10$Jv3xxcZnoteaNznk58pMwORccXHMjfzYTkYZLJAWOJfzwQ/nsRQOm', 'user', 1, NOW(), NULL, NULL, NULL)
ON DUPLICATE KEY UPDATE
    name             = VALUES(name),
    password         = VALUES(password),
    role             = VALUES(role),
    is_verified      = VALUES(is_verified),
    verified_at      = VALUES(verified_at),
    otp_code_hash    = VALUES(otp_code_hash),
    otp_expires_at   = VALUES(otp_expires_at),
    otp_last_sent_at = VALUES(otp_last_sent_at);

INSERT INTO events (title, category, description, date, location, price, image)
VALUES
    ('Tech Summit 2026', 'Technology', 'A one-day conference focused on product engineering, AI workflows, and startup leadership.', '2026-06-18', 'Kathmandu', 49.99, 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80'),
    ('Design Leaders Meetup', 'Design', 'An evening meetup for designers, founders, and front-end engineers.', '2026-07-10', 'Pokhara', 25.00, 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80'),
    ('Community Startup Expo', 'Business', 'A local expo for startups, investors, and students.', '2026-08-05', 'Lalitpur', 0.00, 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80'),
    ('Wedding Expo Nepal', 'Wedding', 'A curated showcase of planners, decorators, photographers, and premium wedding venues.', '2026-08-22', 'Bhaktapur', 35.00, 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80'),
    ('Himalayan Music Night', 'Music', 'An outdoor evening concert featuring indie bands and acoustic performances.', '2026-09-12', 'Pokhara', 18.50, 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200&q=80'),
    ('Nepal Business Leadership Forum', 'Business', 'A full-day forum for founders, executives, and innovators building the next generation of companies.', '2026-10-02', 'Kathmandu', 75.00, 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1200&q=80'),
    ('Festival Food Carnival', 'Food', 'A family-friendly food festival with live stalls, entertainment, and local chef showcases.', '2026-10-18', 'Lalitpur', 12.00, 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80'),
    ('Creators and Freelancers Bootcamp', 'Career', 'Hands-on sessions for creators, freelancers, and small agencies scaling their client work.', '2026-11-07', 'Biratnagar', 29.00, 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80'),
    ('Charity Gala Evening', 'Charity', 'A formal fundraising gala with dinner service, guest speakers, and entertainment.', '2026-12-05', 'Chitwan', 95.00, 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80'),
    ('Nepal Travel and Adventure Expo', 'Travel', 'Discover trekking routes, adventure sports, eco-tourism packages, and local travel startups from across Nepal.', '2026-07-24', 'Pokhara', 20.00, 'https://images.unsplash.com/photo-1465311530779-5241f5a29892?auto=format&fit=crop&w=1200&q=80'),
    ('Teej Celebration and Folk Dance Night', 'Culture', 'A festive evening of Teej songs, folk dance, traditional attire showcases, and community performances.', '2026-08-14', 'Lalitpur', 10.00, 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80'),
    ('Everest Innovation Hackathon', 'Technology', 'Teams build solutions for tourism, logistics, education, and civic life in a high-energy Kathmandu hackathon.', '2026-08-29', 'Kathmandu', 15.00, 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80'),
    ('Dashain Cultural Fair 2026', 'Culture', 'Celebrate Dashain with local crafts, music, family activities, kite stalls, and festive food in one vibrant fairground.', '2026-10-10', 'Kathmandu', 8.00, 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80'),
    ('Pokhara Lakeside Jazz Evening', 'Music', 'A relaxed live jazz evening by the lakeside featuring Nepali and international fusion artists.', '2026-10-24', 'Pokhara', 22.00, 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80'),
    ('Newa Food and Culture Festival', 'Food', 'Taste classic Newari dishes, join cultural performances, and explore heritage crafts from the Kathmandu Valley.', '2026-11-14', 'Kirtipur', 14.00, 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80'),
    ('Tihar Lights and Music Fest', 'Culture', 'An open-air Tihar celebration with lights, deusi-bhailo performances, live bands, and seasonal street food.', '2026-11-16', 'Bhaktapur', 16.00, 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80'),
    ('Nepal Premier Cricket Fan Park', 'Sports', 'Watch parties, skills games, local commentary, and family activities for cricket fans across Nepal.', '2026-12-12', 'Butwal', 12.00, 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80')
ON DUPLICATE KEY UPDATE
    category    = VALUES(category),
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
