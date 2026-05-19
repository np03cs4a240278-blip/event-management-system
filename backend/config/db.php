<?php

function configureConnection(PDO $connection): void
{
    $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
}

function getDatabaseDriver(PDO $connection): string
{
    return (string) $connection->getAttribute(PDO::ATTR_DRIVER_NAME);
}

function columnExists(PDO $connection, string $table, string $column): bool
{
    if (getDatabaseDriver($connection) === 'sqlite') {
        $statement = $connection->query("PRAGMA table_info({$table})");
        $columns = $statement->fetchAll();

        foreach ($columns as $existingColumn) {
            if (($existingColumn['name'] ?? '') === $column) {
                return true;
            }
        }

        return false;
    }

    $quotedColumn = $connection->quote($column);
    $statement = $connection->query("SHOW COLUMNS FROM {$table} LIKE {$quotedColumn}");

    return (bool) $statement->fetch();
}

function ensureColumnExists(PDO $connection, string $table, string $column, string $mysqlDefinition, ?string $sqliteDefinition = null): void
{
    if (columnExists($connection, $table, $column)) {
        return;
    }

    if (getDatabaseDriver($connection) === 'sqlite') {
        $definition = $sqliteDefinition ?? $mysqlDefinition;
        $connection->exec("ALTER TABLE {$table} ADD COLUMN {$column} {$definition}");
        return;
    }

    $connection->exec("ALTER TABLE {$table} ADD COLUMN {$column} {$mysqlDefinition}");
}

function ensureDatabaseStructure(PDO $connection): void
{
    ensureColumnExists(
        $connection,
        'events',
        'category',
        "VARCHAR(100) NOT NULL DEFAULT 'General' AFTER title",
        "TEXT NOT NULL DEFAULT 'General'"
    );

    ensureColumnExists(
        $connection,
        'users',
        'account_status',
        "ENUM('active', 'deactivated') NOT NULL DEFAULT 'active' AFTER password",
        "TEXT NOT NULL DEFAULT 'active'"
    );

    ensureColumnExists(
        $connection,
        'users',
        'deactivated_at',
        "TIMESTAMP NULL DEFAULT NULL AFTER account_status",
        "TEXT NULL DEFAULT NULL"
    );

    ensureColumnExists(
        $connection,
        'users',
        'must_change_password',
        "TINYINT(1) NOT NULL DEFAULT 0 AFTER deactivated_at",
        "INTEGER NOT NULL DEFAULT 0"
    );

    ensureColumnExists(
        $connection,
        'users',
        'is_verified',
        "TINYINT(1) NOT NULL DEFAULT 1 AFTER must_change_password",
        "INTEGER NOT NULL DEFAULT 1"
    );

    ensureColumnExists(
        $connection,
        'users',
        'verified_at',
        "TIMESTAMP NULL DEFAULT NULL AFTER is_verified",
        "TEXT NULL DEFAULT NULL"
    );

    ensureColumnExists(
        $connection,
        'users',
        'otp_code_hash',
        "VARCHAR(255) NULL DEFAULT NULL AFTER verified_at",
        "TEXT NULL DEFAULT NULL"
    );

    ensureColumnExists(
        $connection,
        'users',
        'otp_expires_at',
        "TIMESTAMP NULL DEFAULT NULL AFTER otp_code_hash",
        "TEXT NULL DEFAULT NULL"
    );

    ensureColumnExists(
        $connection,
        'users',
        'otp_last_sent_at',
        "TIMESTAMP NULL DEFAULT NULL AFTER otp_expires_at",
        "TEXT NULL DEFAULT NULL"
    );

    ensureColumnExists(
        $connection,
        'users',
        'otp_purpose',
        "VARCHAR(50) NULL DEFAULT NULL AFTER otp_last_sent_at",
        "TEXT NULL DEFAULT NULL"
    );

    ensureColumnExists(
        $connection,
        'bookings',
        'status',
        "ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending' AFTER event_id",
        "TEXT NOT NULL DEFAULT 'pending'"
    );

    ensureColumnExists(
        $connection,
        'bookings',
        'admin_note',
        "TEXT NULL DEFAULT NULL AFTER status",
        "TEXT NULL DEFAULT NULL"
    );

    ensureColumnExists(
        $connection,
        'bookings',
        'event_type',
        "VARCHAR(100) NULL DEFAULT NULL AFTER admin_note",
        "TEXT NULL DEFAULT NULL"
    );

    ensureColumnExists(
        $connection,
        'bookings',
        'package_name',
        "VARCHAR(150) NULL DEFAULT NULL AFTER event_type",
        "TEXT NULL DEFAULT NULL"
    );

    ensureColumnExists(
        $connection,
        'bookings',
        'start_date',
        "DATE NULL DEFAULT NULL AFTER package_name",
        "TEXT NULL DEFAULT NULL"
    );

    ensureColumnExists(
        $connection,
        'bookings',
        'end_date',
        "DATE NULL DEFAULT NULL AFTER start_date",
        "TEXT NULL DEFAULT NULL"
    );

    ensureColumnExists(
        $connection,
        'bookings',
        'event_date',
        "DATE NULL DEFAULT NULL AFTER end_date",
        "TEXT NULL DEFAULT NULL"
    );

    ensureColumnExists(
        $connection,
        'bookings',
        'time_slot',
        "VARCHAR(50) NULL DEFAULT NULL AFTER event_date",
        "TEXT NULL DEFAULT NULL"
    );

    ensureColumnExists(
        $connection,
        'bookings',
        'guest_count',
        "INT UNSIGNED NOT NULL DEFAULT 1 AFTER time_slot",
        "INTEGER NOT NULL DEFAULT 1"
    );

    ensureColumnExists(
        $connection,
        'bookings',
        'special_request',
        "TEXT NULL DEFAULT NULL AFTER guest_count",
        "TEXT NULL DEFAULT NULL"
    );

    ensureColumnExists(
        $connection,
        'bookings',
        'extra_services',
        "TEXT NULL DEFAULT NULL AFTER special_request",
        "TEXT NULL DEFAULT NULL"
    );

    ensureColumnExists(
        $connection,
        'bookings',
        'venue_price',
        "DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER extra_services",
        "REAL NOT NULL DEFAULT 0"
    );

    ensureColumnExists(
        $connection,
        'bookings',
        'package_price',
        "DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER venue_price",
        "REAL NOT NULL DEFAULT 0"
    );

    ensureColumnExists(
        $connection,
        'bookings',
        'guest_price',
        "DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER package_price",
        "REAL NOT NULL DEFAULT 0"
    );

    ensureColumnExists(
        $connection,
        'bookings',
        'services_price',
        "DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER guest_price",
        "REAL NOT NULL DEFAULT 0"
    );

    ensureColumnExists(
        $connection,
        'bookings',
        'total_price',
        "DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER services_price",
        "REAL NOT NULL DEFAULT 0"
    );

    ensureColumnExists(
        $connection,
        'bookings',
        'created_at',
        "TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP AFTER total_price",
        "TEXT NULL DEFAULT CURRENT_TIMESTAMP"
    );

    ensureColumnExists(
        $connection,
        'bookings',
        'updated_at',
        "TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at",
        "TEXT NULL DEFAULT CURRENT_TIMESTAMP"
    );

    // ── contact_messages: ensure status column exists ──────────────────────
    // This is needed for the Admin Contact Messages module.
    // MySQL uses ENUM; SQLite uses TEXT (both default to 'new').
    ensureColumnExists(
        $connection,
        'contact_messages',
        'status',
        "ENUM('new','read','replied') NOT NULL DEFAULT 'new' AFTER message",
        "TEXT NOT NULL DEFAULT 'new'"
    );
}

function upsertDemoUser(PDO $connection, array $user): void
{
    $findStatement = $connection->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $findStatement->execute(['email' => $user['email']]);
    $existingId = $findStatement->fetchColumn();

    if ($existingId !== false) {
        // Keep existing users untouched so OTP, password changes, and status updates are not lost.
        return;
    }

    $insertStatement = $connection->prepare(
        'INSERT INTO users (
            name, email, password, role, account_status, deactivated_at,
            must_change_password, is_verified, verified_at, otp_code_hash, otp_expires_at, otp_last_sent_at, otp_purpose
        ) VALUES (
            :name, :email, :password, :role, :account_status, :deactivated_at,
            :must_change_password, :is_verified, :verified_at, :otp_code_hash, :otp_expires_at, :otp_last_sent_at, :otp_purpose
        )'
    );

    $insertStatement->execute([
        'name' => $user['name'],
        'email' => $user['email'],
        'password' => $user['password'],
        'role' => $user['role'],
        'account_status' => 'active',
        'deactivated_at' => null,
        'must_change_password' => 0,
        'is_verified' => 1,
        'verified_at' => date('Y-m-d H:i:s'),
        'otp_code_hash' => null,
        'otp_expires_at' => null,
        'otp_last_sent_at' => null,
        'otp_purpose' => null,
    ]);
}

function ensureDemoUsers(PDO $connection): void
{
    $demoUsers = [
        [
            'name' => 'Admin User',
            'email' => 'admin@gmail.com',
            'password' => '$2y$10$3TUJ7d.ge78QU/875SIpy.OJBkYNVJ5ijPxq8RTp5CI6ukMww1gza',
            'role' => 'admin',
        ],
        [
            'name' => 'Sample User',
            'email' => 'user@gmail.com',
            'password' => '$2y$10$Jv3xxcZnoteaNznk58pMwORccXHMjfzYTkYZLJAWOJfzwQ/nsRQOm',
            'role' => 'user',
        ],
    ];

    foreach ($demoUsers as $demoUser) {
        upsertDemoUser($connection, $demoUser);
    }
}

function getDemoEvents(): array
{
    return [
        [
            'title' => 'Tech Summit 2026',
            'category' => 'Technology',
            'description' => 'A one-day conference focused on product engineering, AI workflows, and startup leadership.',
            'date' => '2026-06-18',
            'location' => 'Kathmandu',
            'price' => 49.99,
            'image' => 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
        ],
        [
            'title' => 'Design Leaders Meetup',
            'category' => 'Design',
            'description' => 'An evening meetup for designers, founders, and front-end engineers.',
            'date' => '2026-07-10',
            'location' => 'Pokhara',
            'price' => 25.00,
            'image' => 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
        ],
        [
            'title' => 'Community Startup Expo',
            'category' => 'Business',
            'description' => 'A local expo for startups, investors, and students.',
            'date' => '2026-08-05',
            'location' => 'Lalitpur',
            'price' => 0.00,
            'image' => 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
        ],
        [
            'title' => 'Wedding Expo Nepal',
            'category' => 'Wedding',
            'description' => 'A curated showcase of planners, decorators, photographers, and premium wedding venues.',
            'date' => '2026-08-22',
            'location' => 'Bhaktapur',
            'price' => 35.00,
            'image' => 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80',
        ],
        [
            'title' => 'Himalayan Music Night',
            'category' => 'Music',
            'description' => 'An outdoor evening concert featuring indie bands and acoustic performances.',
            'date' => '2026-09-12',
            'location' => 'Pokhara',
            'price' => 18.50,
            'image' => 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200&q=80',
        ],
        [
            'title' => 'Nepal Business Leadership Forum',
            'category' => 'Business',
            'description' => 'A full-day forum for founders, executives, and innovators building the next generation of companies.',
            'date' => '2026-10-02',
            'location' => 'Kathmandu',
            'price' => 75.00,
            'image' => 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1200&q=80',
        ],
        [
            'title' => 'Festival Food Carnival',
            'category' => 'Food',
            'description' => 'A family-friendly food festival with live stalls, entertainment, and local chef showcases.',
            'date' => '2026-10-18',
            'location' => 'Lalitpur',
            'price' => 12.00,
            'image' => 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80',
        ],
        [
            'title' => 'Creators and Freelancers Bootcamp',
            'category' => 'Career',
            'description' => 'Hands-on sessions for creators, freelancers, and small agencies scaling their client work.',
            'date' => '2026-11-07',
            'location' => 'Biratnagar',
            'price' => 29.00,
            'image' => 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
        ],
        [
            'title' => 'Charity Gala Evening',
            'category' => 'Charity',
            'description' => 'A formal fundraising gala with dinner service, guest speakers, and entertainment.',
            'date' => '2026-12-05',
            'location' => 'Chitwan',
            'price' => 95.00,
            'image' => 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
        ],
        [
            'title' => 'Nepal Travel and Adventure Expo',
            'category' => 'Travel',
            'description' => 'Discover trekking routes, adventure sports, eco-tourism packages, and local travel startups from across Nepal.',
            'date' => '2026-07-24',
            'location' => 'Pokhara',
            'price' => 20.00,
            'image' => 'https://images.unsplash.com/photo-1465311530779-5241f5a29892?auto=format&fit=crop&w=1200&q=80',
        ],
        [
            'title' => 'Teej Celebration and Folk Dance Night',
            'category' => 'Culture',
            'description' => 'A festive evening of Teej songs, folk dance, traditional attire showcases, and community performances.',
            'date' => '2026-08-14',
            'location' => 'Lalitpur',
            'price' => 10.00,
            'image' => 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=1200&q=80',
        ],
        [
            'title' => 'Everest Innovation Hackathon',
            'category' => 'Technology',
            'description' => 'Teams build solutions for tourism, logistics, education, and civic life in a high-energy Kathmandu hackathon.',
            'date' => '2026-08-29',
            'location' => 'Kathmandu',
            'price' => 15.00,
            'image' => 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
        ],
        [
            'title' => 'Dashain Cultural Fair 2026',
            'category' => 'Culture',
            'description' => 'Celebrate Dashain with local crafts, music, family activities, kite stalls, and festive food in one vibrant fairground.',
            'date' => '2026-10-10',
            'location' => 'Kathmandu',
            'price' => 8.00,
            'image' => 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80',
        ],
        [
            'title' => 'Pokhara Lakeside Jazz Evening',
            'category' => 'Music',
            'description' => 'A relaxed live jazz evening by the lakeside featuring Nepali and international fusion artists.',
            'date' => '2026-10-24',
            'location' => 'Pokhara',
            'price' => 22.00,
            'image' => 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1200&q=80',
        ],
        [
            'title' => 'Newa Food and Culture Festival',
            'category' => 'Food',
            'description' => 'Taste classic Newari dishes, join cultural performances, and explore heritage crafts from the Kathmandu Valley.',
            'date' => '2026-11-14',
            'location' => 'Kirtipur',
            'price' => 14.00,
            'image' => 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80',
        ],
        [
            'title' => 'Tihar Lights and Music Fest',
            'category' => 'Culture',
            'description' => 'An open-air Tihar celebration with lights, deusi-bhailo performances, live bands, and seasonal street food.',
            'date' => '2026-11-16',
            'location' => 'Bhaktapur',
            'price' => 16.00,
            'image' => 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
        ],
        [
            'title' => 'Nepal Premier Cricket Fan Park',
            'category' => 'Sports',
            'description' => 'Watch parties, skills games, local commentary, and family activities for cricket fans across Nepal.',
            'date' => '2026-12-12',
            'location' => 'Butwal',
            'price' => 12.00,
            'image' => 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80',
        ],
    ];
}

function ensureDemoEvents(PDO $connection): void
{
    $findStatement = $connection->prepare('SELECT id FROM events WHERE title = :title LIMIT 1');
    $updateStatement = $connection->prepare(
        'UPDATE events
         SET category = :category,
             description = :description,
             date = :date,
             location = :location,
             price = :price,
             image = :image
         WHERE id = :id
           AND (category IS NULL OR category = "" OR category = "General")'
    );
    $insertStatement = $connection->prepare(
        'INSERT INTO events (title, category, description, date, location, price, image)
         VALUES (:title, :category, :description, :date, :location, :price, :image)'
    );

    foreach (getDemoEvents() as $event) {
        $findStatement->execute(['title' => $event['title']]);
        $existingId = $findStatement->fetchColumn();

        if ($existingId !== false) {
            $updateStatement->execute([
                'id' => $existingId,
                'category' => $event['category'],
                'description' => $event['description'],
                'date' => $event['date'],
                'location' => $event['location'],
                'price' => $event['price'],
                'image' => $event['image'],
            ]);
            continue;
        }

        $insertStatement->execute($event);
    }
}

function removeDuplicateDemoEvents(PDO $connection): void
{
    $findStatement = $connection->prepare('SELECT id FROM events WHERE title = :title ORDER BY id ASC');
    $bookingCountStatement = $connection->prepare('SELECT COUNT(*) FROM bookings WHERE event_id = :event_id');
    $deleteStatement = $connection->prepare('DELETE FROM events WHERE id = :id');

    foreach (getDemoEvents() as $event) {
        $findStatement->execute(['title' => $event['title']]);
        $eventIds = array_map('intval', $findStatement->fetchAll(PDO::FETCH_COLUMN) ?: []);

        if (count($eventIds) <= 1) {
            continue;
        }

        array_shift($eventIds);

        foreach ($eventIds as $eventId) {
            $bookingCountStatement->execute(['event_id' => $eventId]);
            $hasBookings = (int) $bookingCountStatement->fetchColumn() > 0;

            if ($hasBookings) {
                continue;
            }

            $deleteStatement->execute(['id' => $eventId]);
        }
    }
}

function ensureDemoBookings(PDO $connection): void
{
    $userIdStatement = $connection->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $eventIdStatement = $connection->prepare('SELECT id FROM events WHERE title = :title LIMIT 1');
    $existsStatement = $connection->prepare('SELECT id FROM bookings WHERE user_id = :user_id AND event_id = :event_id LIMIT 1');
    $insertStatement = $connection->prepare(
        'INSERT INTO bookings (
            user_id, event_id, status, event_type, guest_count, venue_price, total_price
        ) VALUES (
            :user_id, :event_id, :status, :event_type, :guest_count, :venue_price, :total_price
        )'
    );

    $userIdStatement->execute(['email' => 'user@gmail.com']);
    $userId = (int)($userIdStatement->fetchColumn() ?: 0);

    if ($userId <= 0) {
        return;
    }

    $demoBookings = [
        ['title' => 'Tech Summit 2026', 'event_type' => 'conference'],
        ['title' => 'Nepal Business Leadership Forum', 'event_type' => 'forum'],
    ];

    foreach ($demoBookings as $demoBooking) {
        $eventIdStatement->execute(['title' => $demoBooking['title']]);
        $eventId = (int)($eventIdStatement->fetchColumn() ?: 0);

        if ($eventId <= 0) {
            continue;
        }

        $existsStatement->execute([
            'user_id' => $userId,
            'event_id' => $eventId,
        ]);

        if ($existsStatement->fetchColumn() !== false) {
            continue;
        }

        $event = null;
        foreach (getDemoEvents() as $candidateEvent) {
            if ($candidateEvent['title'] === $demoBooking['title']) {
                $event = $candidateEvent;
                break;
            }
        }

        $insertStatement->execute([
            'user_id' => $userId,
            'event_id' => $eventId,
            'status' => 'confirmed',
            'event_type' => $demoBooking['event_type'],
            'guest_count' => 1,
            'venue_price' => (float)($event['price'] ?? 0),
            'total_price' => (float)($event['price'] ?? 0),
        ]);
    }
}

function disableLegacyTemporaryPasswords(PDO $connection): void
{
    if (!columnExists($connection, 'users', 'must_change_password')) {
        return;
    }

    $connection->exec('UPDATE users SET must_change_password = 0 WHERE must_change_password <> 0');
}

function mergeLegacyEventIntoCanonical(PDO $connection, string $legacyTitle, string $canonicalTitle): void
{
    $findEventStatement = $connection->prepare('SELECT id FROM events WHERE title = :title ORDER BY id ASC');
    $findBookingsStatement = $connection->prepare('SELECT id, user_id FROM bookings WHERE event_id = :event_id ORDER BY id ASC');
    $hasCanonicalBookingStatement = $connection->prepare(
        'SELECT id FROM bookings WHERE user_id = :user_id AND event_id = :event_id LIMIT 1'
    );
    $moveBookingStatement = $connection->prepare('UPDATE bookings SET event_id = :event_id WHERE id = :id');
    $deleteBookingStatement = $connection->prepare('DELETE FROM bookings WHERE id = :id');
    $deleteEventStatement = $connection->prepare('DELETE FROM events WHERE id = :id');

    $findEventStatement->execute(['title' => $legacyTitle]);
    $legacyIds = array_map('intval', $findEventStatement->fetchAll(PDO::FETCH_COLUMN) ?: []);

    $findEventStatement->execute(['title' => $canonicalTitle]);
    $canonicalId = (int)($findEventStatement->fetchColumn() ?: 0);

    if (empty($legacyIds) || $canonicalId <= 0) {
        return;
    }

    foreach ($legacyIds as $legacyId) {
        if ($legacyId === $canonicalId) {
            continue;
        }

        $findBookingsStatement->execute(['event_id' => $legacyId]);
        $legacyBookings = $findBookingsStatement->fetchAll() ?: [];

        foreach ($legacyBookings as $legacyBooking) {
            $bookingId = (int)($legacyBooking['id'] ?? 0);
            $userId = (int)($legacyBooking['user_id'] ?? 0);

            if ($bookingId <= 0 || $userId <= 0) {
                continue;
            }

            $hasCanonicalBookingStatement->execute([
                'user_id' => $userId,
                'event_id' => $canonicalId,
            ]);

            if ($hasCanonicalBookingStatement->fetchColumn() !== false) {
                $deleteBookingStatement->execute(['id' => $bookingId]);
                continue;
            }

            $moveBookingStatement->execute([
                'id' => $bookingId,
                'event_id' => $canonicalId,
            ]);
        }

        $deleteEventStatement->execute(['id' => $legacyId]);
    }
}

function getSqliteDatabasePath(): string
{
    return getBackendStorageDirectory() . '/event_management_system.sqlite';
}

function ensureSqliteSchema(PDO $connection): void
{
    $connection->exec('PRAGMA foreign_keys = ON');

    $connection->exec(
        "CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            account_status TEXT NOT NULL DEFAULT 'active',
            deactivated_at TEXT NULL DEFAULT NULL,
            must_change_password INTEGER NOT NULL DEFAULT 0,
            is_verified INTEGER NOT NULL DEFAULT 1,
            verified_at TEXT NULL DEFAULT NULL,
            otp_code_hash TEXT NULL DEFAULT NULL,
            otp_expires_at TEXT NULL DEFAULT NULL,
            otp_last_sent_at TEXT NULL DEFAULT NULL,
            otp_purpose TEXT NULL DEFAULT NULL,
            role TEXT NOT NULL DEFAULT 'user',
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )"
    );

    $connection->exec(
        "CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL DEFAULT 'General',
            description TEXT NOT NULL,
            date TEXT NOT NULL,
            location TEXT NOT NULL,
            price REAL NOT NULL DEFAULT 0,
            image TEXT NOT NULL DEFAULT '',
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )"
    );

    $connection->exec(
        "CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            event_id INTEGER NOT NULL,
            status TEXT NOT NULL DEFAULT 'pending',
            admin_note TEXT NULL,
            event_type TEXT NULL,
            package_name TEXT NULL,
            start_date TEXT NULL,
            end_date TEXT NULL,
            event_date TEXT NULL,
            time_slot TEXT NULL,
            guest_count INTEGER NOT NULL DEFAULT 1,
            special_request TEXT NULL,
            extra_services TEXT NULL,
            venue_price REAL NOT NULL DEFAULT 0,
            package_price REAL NOT NULL DEFAULT 0,
            guest_price REAL NOT NULL DEFAULT 0,
            services_price REAL NOT NULL DEFAULT 0,
            total_price REAL NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(event_id) REFERENCES events(id) ON DELETE CASCADE,
            UNIQUE(user_id, event_id)
        )"
    );

    // contact_messages — includes status column from the start
    $connection->exec(
        "CREATE TABLE IF NOT EXISTS contact_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'new',
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )"
    );

    // Run ensureDatabaseStructure AFTER table creation so any missing
    // columns (e.g. status on an existing SQLite DB) are added automatically.
    ensureDatabaseStructure($connection);
}

function seedSqliteDatabase(PDO $connection): void
{
    $userCount = (int) ($connection->query('SELECT COUNT(*) FROM users')->fetchColumn() ?: 0);

    if ($userCount === 0) {
        $statement = $connection->prepare(
            'INSERT INTO users (name, email, password, role)
             VALUES (:name, :email, :password, :role)'
        );

        $seedUsers = [
            [
                'name' => 'Admin User',
                'email' => 'admin@gmail.com',
                'password' => '$2y$10$3TUJ7d.ge78QU/875SIpy.OJBkYNVJ5ijPxq8RTp5CI6ukMww1gza',
                'role' => 'admin',
            ],
            [
                'name' => 'Sample User',
                'email' => 'user@gmail.com',
                'password' => '$2y$10$Jv3xxcZnoteaNznk58pMwORccXHMjfzYTkYZLJAWOJfzwQ/nsRQOm',
                'role' => 'user',
            ],
        ];

        foreach ($seedUsers as $seedUser) {
            $statement->execute($seedUser);
        }
    }

    ensureDemoUsers($connection);

    ensureDemoEvents($connection);
    removeDuplicateDemoEvents($connection);
    mergeLegacyEventIntoCanonical($connection, 'Tech Summit 2023', 'Tech Summit 2026');
    ensureDemoBookings($connection);
    disableLegacyTemporaryPasswords($connection);
}

function createSqliteConnection(): PDO
{
    $connection = new PDO('sqlite:' . getSqliteDatabasePath());
    configureConnection($connection);
    ensureSqliteSchema($connection);
    seedSqliteDatabase($connection);

    return $connection;
}

function createMysqlConnection(): PDO
{
    $host = getenv('DB_HOST') ?: '127.0.0.1';
    $port = getenv('DB_PORT') ?: '3306';
    $dbname = getenv('DB_NAME') ?: 'event_management_system';
    $user = getenv('DB_USER') ?: 'root';
    $pass = getenv('DB_PASSWORD') ?: '';
    $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";

    $connection = new PDO($dsn, $user, $pass);
    configureConnection($connection);
    ensureDatabaseStructure($connection);
    ensureDemoUsers($connection);
    ensureDemoEvents($connection);
    removeDuplicateDemoEvents($connection);
    mergeLegacyEventIntoCanonical($connection, 'Tech Summit 2023', 'Tech Summit 2026');
    ensureDemoBookings($connection);
    disableLegacyTemporaryPasswords($connection);

    return $connection;
}

function getDatabaseConnection()
{
    static $connection = null;

    if ($connection !== null) {
        return $connection;
    }

    try {
        $connection = createMysqlConnection();
    } catch (PDOException $exception) {
        $connection = createSqliteConnection();
    }

    return $connection;
}
