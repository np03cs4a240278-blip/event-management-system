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
            'description' => 'A one-day conference focused on product engineering, AI workflows, and startup leadership.',
            'date' => '2026-06-18',
            'location' => 'Kathmandu',
            'price' => 49.99,
            'image' => 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
        ],
        [
            'title' => 'Design Leaders Meetup',
            'description' => 'An evening meetup for designers, founders, and front-end engineers.',
            'date' => '2026-07-10',
            'location' => 'Pokhara',
            'price' => 25.00,
            'image' => 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
        ],
        [
            'title' => 'Community Startup Expo',
            'description' => 'A local expo for startups, investors, and students.',
            'date' => '2026-08-05',
            'location' => 'Lalitpur',
            'price' => 0.00,
            'image' => 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80',
        ],
        [
            'title' => 'Wedding Expo Nepal',
            'description' => 'A curated showcase of planners, decorators, photographers, and premium wedding venues.',
            'date' => '2026-08-22',
            'location' => 'Bhaktapur',
            'price' => 35.00,
            'image' => 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80',
        ],
        [
            'title' => 'Himalayan Music Night',
            'description' => 'An outdoor evening concert featuring indie bands and acoustic performances.',
            'date' => '2026-09-12',
            'location' => 'Pokhara',
            'price' => 18.50,
            'image' => 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200&q=80',
        ],
        [
            'title' => 'Nepal Business Leadership Forum',
            'description' => 'A full-day forum for founders, executives, and innovators building the next generation of companies.',
            'date' => '2026-10-02',
            'location' => 'Kathmandu',
            'price' => 75.00,
            'image' => 'https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=1200&q=80',
        ],
        [
            'title' => 'Festival Food Carnival',
            'description' => 'A family-friendly food festival with live stalls, entertainment, and local chef showcases.',
            'date' => '2026-10-18',
            'location' => 'Lalitpur',
            'price' => 12.00,
            'image' => 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=1200&q=80',
        ],
        [
            'title' => 'Creators and Freelancers Bootcamp',
            'description' => 'Hands-on sessions for creators, freelancers, and small agencies scaling their client work.',
            'date' => '2026-11-07',
            'location' => 'Biratnagar',
            'price' => 29.00,
            'image' => 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
        ],
        [
            'title' => 'Charity Gala Evening',
            'description' => 'A formal fundraising gala with dinner service, guest speakers, and entertainment.',
            'date' => '2026-12-05',
            'location' => 'Chitwan',
            'price' => 95.00,
            'image' => 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
        ],
    ];
}

function ensureDemoEvents(PDO $connection): void
{
    $findStatement = $connection->prepare('SELECT id FROM events WHERE title = :title LIMIT 1');
    $insertStatement = $connection->prepare(
        'INSERT INTO events (title, description, date, location, price, image)
         VALUES (:title, :description, :date, :location, :price, :image)'
    );

    foreach (getDemoEvents() as $event) {
        $findStatement->execute(['title' => $event['title']]);
        $existingId = $findStatement->fetchColumn();

        if ($existingId !== false) {
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

    $connection->exec(
        "CREATE TABLE IF NOT EXISTS contact_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )"
    );

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
