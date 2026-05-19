<?php
declare(strict_types=1);

/**
 * ContactMessage model
 *
 * Handles all database operations for the contact_messages table.
 * The `status` column is added automatically by ensureDatabaseStructure()
 * in db.php, so it is always present when this model runs.
 */
class ContactMessage
{
    private PDO $database;

    public function __construct(PDO $database)
    {
        $this->database = $database;
    }

    // ── Create a new contact message (public form submission) ──────────────
    public function create(array $data): array
    {
        $statement = $this->database->prepare(
            "INSERT INTO contact_messages (name, email, message, status)
             VALUES (:name, :email, :message, 'new')"
        );

        $statement->execute([
            'name'    => $data['name'],
            'email'   => $data['email'],
            'message' => $data['message'],
        ]);

        $createdId = (int) $this->database->lastInsertId();
        return $this->findById($createdId);
    }

    // ── Get all messages, newest first (admin) ─────────────────────────────
    public function all(): array
    {
        $statement = $this->database->query(
            "SELECT id, name, email, message, status, created_at
             FROM contact_messages
             ORDER BY created_at DESC"
        );
        return $statement->fetchAll() ?: [];
    }

    // ── Find a single message by ID ────────────────────────────────────────
    public function findById(int $id): array
    {
        $statement = $this->database->prepare(
            "SELECT id, name, email, message, status, created_at
             FROM contact_messages
             WHERE id = :id
             LIMIT 1"
        );
        $statement->execute(['id' => $id]);
        return $statement->fetch() ?: [];
    }

    // ── Update status of a message (admin) ────────────────────────────────
    public function updateStatus(int $id, string $status): array
    {
        $allowed = ['new', 'read', 'replied'];
        if (!in_array($status, $allowed, true)) {
            return [];
        }

        $statement = $this->database->prepare(
            'UPDATE contact_messages SET status = :status WHERE id = :id'
        );
        $statement->execute(['status' => $status, 'id' => $id]);

        return $this->findById($id);
    }

    // ── Delete a message (admin) ───────────────────────────────────────────
    public function delete(int $id): bool
    {
        $statement = $this->database->prepare(
            'DELETE FROM contact_messages WHERE id = :id'
        );
        $statement->execute(['id' => $id]);
        return $statement->rowCount() > 0;
    }

    // ── Count unread messages (status = 'new') for the badge ──────────────
    public function countUnread(): int
    {
        $statement = $this->database->query(
            "SELECT COUNT(*) FROM contact_messages WHERE status = 'new'"
        );
        return (int) $statement->fetchColumn();
    }
}
