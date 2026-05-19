<?php
declare(strict_types=1);

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
            'INSERT INTO contact_messages (name, email, message)
             VALUES (:name, :email, :message)'
        );

        $statement->execute([
            'name'    => $data['name'],
            'email'   => $data['email'],
            'message' => $data['message'],
        ]);

        $createdId = (int) $this->database->lastInsertId();
        return $this->findById($createdId);
    }

    // ── Get all messages, newest first ─────────────────────────────────────
    public function all(): array
    {
        // Support optional status column (added via migration)
        $statement = $this->database->query(
            "SELECT id, name, email, message,
                    COALESCE(status, 'new') AS status,
                    created_at
             FROM contact_messages
             ORDER BY created_at DESC"
        );
        return $statement->fetchAll() ?: [];
    }

    // ── Find a single message by ID ────────────────────────────────────────
    public function findById(int $id): array
    {
        $statement = $this->database->prepare(
            "SELECT id, name, email, message,
                    COALESCE(status, 'new') AS status,
                    created_at
             FROM contact_messages
             WHERE id = :id
             LIMIT 1"
        );
        $statement->execute(['id' => $id]);
        return $statement->fetch() ?: [];
    }

    // ── Update status (new → read → replied) ──────────────────────────────
    public function updateStatus(int $id, string $status): array
    {
        $allowed = ['new', 'read', 'replied'];
        if (!in_array($status, $allowed, true)) {
            return [];
        }

        // Try to update — if status column doesn't exist yet, silently skip
        try {
            $statement = $this->database->prepare(
                'UPDATE contact_messages SET status = :status WHERE id = :id'
            );
            $statement->execute(['status' => $status, 'id' => $id]);
        } catch (\PDOException $e) {
            // Column may not exist yet — return current record anyway
        }

        return $this->findById($id);
    }

    // ── Delete a message ───────────────────────────────────────────────────
    public function delete(int $id): bool
    {
        $statement = $this->database->prepare(
            'DELETE FROM contact_messages WHERE id = :id'
        );
        $statement->execute(['id' => $id]);
        return $statement->rowCount() > 0;
    }

    // ── Count unread (status = 'new') messages ─────────────────────────────
    public function countUnread(): int
    {
        try {
            $statement = $this->database->query(
                "SELECT COUNT(*) FROM contact_messages WHERE COALESCE(status, 'new') = 'new'"
            );
            return (int) $statement->fetchColumn();
        } catch (\PDOException $e) {
            // If status column doesn't exist, count all messages
            $statement = $this->database->query(
                'SELECT COUNT(*) FROM contact_messages'
            );
            return (int) $statement->fetchColumn();
        }
    }
}
