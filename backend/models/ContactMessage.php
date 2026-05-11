<?php
declare(strict_types=1);

class ContactMessage
{
    private PDO $database;

    public function __construct(PDO $database)
    {
        $this->database = $database;
    }

    public function create(array $data): array
    {
        $statement = $this->database->prepare(
            'INSERT INTO contact_messages (name, email, message)
             VALUES (:name, :email, :message)'
        );

        $statement->execute([
            'name' => $data['name'],
            'email' => $data['email'],
            'message' => $data['message'],
        ]);

        $createdId = (int) $this->database->lastInsertId();
        $result = $this->database->prepare(
            'SELECT id, name, email, message, created_at
             FROM contact_messages
             WHERE id = :id
             LIMIT 1'
        );
        $result->execute(['id' => $createdId]);

        return $result->fetch() ?: [];
    }
}
