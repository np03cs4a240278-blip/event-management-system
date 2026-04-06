<?php

class Booking
{
    private $db;

    public function __construct($database)
    {
        $this->db = $database;
    }

    // Check if user already booked this event
    public function existsForUserEvent($userId, $eventId)
    {
        $sql = "SELECT id FROM bookings WHERE user_id = :user_id AND event_id = :event_id LIMIT 1";
        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'user_id' => $userId,
            'event_id' => $eventId
        ]);

        return $stmt->fetch() ? true : false;
    }

    // Create booking
    public function create($userId, $eventId)
    {
        $sql = "INSERT INTO bookings (user_id, event_id) VALUES (:user_id, :event_id)";
        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'user_id' => $userId,
            'event_id' => $eventId
        ]);

        // Get inserted booking
        $id = $this->db->lastInsertId();

        $stmt = $this->db->prepare("SELECT * FROM bookings WHERE id = :id");
        $stmt->execute(['id' => $id]);

        $booking = $stmt->fetch();

        return [
            'id' => (int)$booking['id'],
            'user_id' => (int)$booking['user_id'],
            'event_id' => (int)$booking['event_id'],
            'created_at' => $booking['created_at']
        ];
    }

    // Find booking by ID
    public function findById($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM bookings WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);

        return $stmt->fetch() ?: null;
    }

    // Delete booking by ID
    public function delete($id)
    {
        $stmt = $this->db->prepare("DELETE FROM bookings WHERE id = :id");
        $stmt->execute(['id' => $id]);

        return $stmt->rowCount() > 0;
    }

    // Get bookings for logged-in user
    public function userBookings($userId)
    {
        $sql = "
            SELECT b.*, e.title, e.description, e.date, e.location, e.price, e.image
            FROM bookings b
            JOIN events e ON e.id = b.event_id
            WHERE b.user_id = :user_id
            ORDER BY b.created_at DESC
        ";

        $stmt = $this->db->prepare($sql);
        $stmt->execute(['user_id' => $userId]);

        $results = $stmt->fetchAll();

        $bookings = [];

        foreach ($results as $row) {
            $bookings[] = [
                'id' => (int)$row['id'],
                'created_at' => $row['created_at'],
                'event' => [
                    'id' => (int)$row['event_id'],
                    'title' => $row['title'],
                    'description' => $row['description'],
                    'date' => $row['date'],
                    'location' => $row['location'],
                    'price' => (float)$row['price'],
                    'image' => $row['image']
                ]
            ];
        }

        return $bookings;
    }

    // Get all bookings (admin)
    public function allBookings()
    {
        $sql = "
            SELECT b.*, u.name, u.email, e.title, e.date, e.location, e.price
            FROM bookings b
            JOIN users u ON u.id = b.user_id
            JOIN events e ON e.id = b.event_id
            ORDER BY b.created_at DESC
        ";

        $stmt = $this->db->query($sql);
        $results = $stmt->fetchAll();

        $bookings = [];

        foreach ($results as $row) {
            $bookings[] = [
                'id' => (int)$row['id'],
                'created_at' => $row['created_at'],
                'user' => [
                    'id' => (int)$row['user_id'],
                    'name' => $row['name'],
                    'email' => $row['email']
                ],
                'event' => [
                    'id' => (int)$row['event_id'],
                    'title' => $row['title'],
                    'date' => $row['date'],
                    'location' => $row['location'],
                    'price' => (float)$row['price']
                ]
            ];
        }

        return $bookings;
    }
}
