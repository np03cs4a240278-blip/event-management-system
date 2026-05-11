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
}

function upsertDemoUser(PDO $connection, array $user): void
{
    $findStatement = $connection->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
    $findStatement->execute(['email' => $user['email']]);
    $existingId = $findStatement->fetchColumn();

    if ($existingId !== false) {
        $updateStatement = $connection->prepare(
            'UPDATE users
             SET name = :name,
                 password = :password,
                 role = :role,
                 account_status = :account_status,
                 deactivated_at = :deactivated_at,
                 must_change_password = :must_change_password
             WHERE id = :id'
        );

        $updateStatement->execute([
            'id' => (int) $existingId,
            'name' => $user['name'],
            'password' => $user['password'],
            'role' => $user['role'],
            'account_status' => 'active',
            'deactivated_at' => null,
            'must_change_password' => 0,
        ]);

        return;
    }

    $insertStatement = $connection->prepare(
        'INSERT INTO users (name, email, password, role, account_status, deactivated_at, must_change_password)
         VALUES (:name, :email, :password, :role, :account_status, :deactivated_at, :must_change_password)'
    );

    $insertStatement->execute([
        'name' => $user['name'],
        'email' => $user['email'],
        'password' => $user['password'],
        'role' => $user['role'],
        'account_status' => 'active',
        'deactivated_at' => null,
        'must_change_password' => 0,
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

function getSqliteDatabasePath(): string
{
    $storageDirectory = dirname(__DIR__) . '/storage';

    if (!is_dir($storageDirectory)) {
        mkdir($storageDirectory, 0777, true);
    }

    return $storageDirectory . '/event_management_system.sqlite';
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

    $eventCount = (int) ($connection->query('SELECT COUNT(*) FROM events')->fetchColumn() ?: 0);

    if ($eventCount === 0) {
        $statement = $connection->prepare(
            'INSERT INTO events (title, description, date, location, price, image)
             VALUES (:title, :description, :date, :location, :price, :image)'
        );

        $seedEvents = [
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
        ];

        foreach ($seedEvents as $seedEvent) {
            $statement->execute($seedEvent);
        }
    }
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
