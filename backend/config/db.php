<?php
// This function connects to the database and returns the connection

function ensureDatabaseStructure($connection)
{
    $stmt = $connection->query("SHOW COLUMNS FROM users LIKE 'must_change_password'");
    $column = $stmt->fetch();

    if (!$column) {
        $connection->exec(
            "ALTER TABLE users
             ADD COLUMN must_change_password TINYINT(1) NOT NULL DEFAULT 0 AFTER password"
        );
    }
}

function getDatabaseConnection()
{
    // Static variable means it remembers the connection
    static $connection = null;

    // If already connected, return existing connection
    if ($connection !== null) {
        return $connection;
    }

    // Database details (from environment or default)
    $host = getenv('DB_HOST') ?: '127.0.0.1';
    $port = getenv('DB_PORT') ?: '3306';
    $dbname = getenv('DB_NAME') ?: 'event_management_system';
    $user = getenv('DB_USER') ?: 'root';
    $pass = getenv('DB_PASSWORD') ?: '';

    // DSN = connection string
    $dsn = "mysql:host=$host;port=$port;dbname=$dbname;charset=utf8mb4";

    try {
        // Create database connection
        $connection = new PDO($dsn, $user, $pass);

        // Show errors if something goes wrong
        $connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

        // Return results as associative array
        $connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

        ensureDatabaseStructure($connection);

    } catch (PDOException $e) {
        die("Database connection failed: " . $e->getMessage());
    }

    return $connection;
}
