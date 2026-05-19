<?php
declare(strict_types=1);

class Event
{
    private PDO $database;

    public function __construct(PDO $database)
    {
        $this->database = $database;
    }

    public function all(?string $search = null, ?string $location = null, ?string $category = null): array
    {
        $sql = 'SELECT * FROM events WHERE 1=1';
        $params = [];

        if ($search !== null && $search !== '') {
            $sql .= ' AND title LIKE :search';
            $params['search'] = '%' . $search . '%';
        }

        if ($location !== null && $location !== '') {
            $sql .= ' AND location LIKE :location';
            $params['location'] = '%' . $location . '%';
        }

        if ($category !== null && $category !== '') {
            $sql .= ' AND category = :category';
            $params['category'] = $category;
        }

        $sql .= ' ORDER BY date ASC, created_at DESC';

        $statement = $this->database->prepare($sql);
        $statement->execute($params);

        return array_map([$this, 'mapEvent'], $statement->fetchAll());
    }

    public function findById(int $id): ?array
    {
        $statement = $this->database->prepare('SELECT * FROM events WHERE id = :id LIMIT 1');
        $statement->execute(['id' => $id]);
        $event = $statement->fetch();

        return $event !== false ? $this->mapEvent($event) : null;
    }

    public function create(array $data): array
    {
        $statement = $this->database->prepare(
            'INSERT INTO events (title, category, description, date, location, price, image)
             VALUES (:title, :category, :description, :date, :location, :price, :image)'
        );
        $statement->execute([
            'title' => $data['title'],
            'category' => $data['category'],
            'description' => $data['description'],
            'date' => $data['date'],
            'location' => $data['location'],
            'price' => $data['price'],
            'image' => $data['image'],
        ]);

        $createdEvent = $this->findById((int) $this->database->lastInsertId());

        if ($createdEvent === null) {
            throw new RuntimeException('Event could not be loaded after creation.');
        }

        return $createdEvent;
    }

    public function update(int $id, array $data): ?array
    {
        $statement = $this->database->prepare(
            'UPDATE events
             SET title = :title,
                 category = :category,
                 description = :description,
                 date = :date,
                 location = :location,
                 price = :price,
                 image = :image
             WHERE id = :id'
        );
        $statement->execute([
            'id' => $id,
            'title' => $data['title'],
            'category' => $data['category'],
            'description' => $data['description'],
            'date' => $data['date'],
            'location' => $data['location'],
            'price' => $data['price'],
            'image' => $data['image'],
        ]);

        if ($statement->rowCount() === 0 && $this->findById($id) === null) {
            return null;
        }

        return $this->findById($id);
    }

    public function delete(int $id): bool
    {
        $statement = $this->database->prepare('DELETE FROM events WHERE id = :id');
        $statement->execute(['id' => $id]);

        return $statement->rowCount() > 0;
    }

    private function mapEvent(array $event): array
    {
        return [
            'id' => (int) $event['id'],
            'title' => $event['title'],
            'category' => $event['category'] ?? 'General',
            'description' => $event['description'],
            'date' => $event['date'],
            'location' => $event['location'],
            'price' => (float) $event['price'],
            'image' => $event['image'],
            'created_at' => $event['created_at'] ?? null,
            'updated_at' => $event['updated_at'] ?? null,
        ];
    }
}
