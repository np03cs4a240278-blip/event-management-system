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
<<<<<<< HEAD
        $sql  = "SELECT id FROM bookings WHERE user_id = :user_id AND event_id = :event_id LIMIT 1";
        $stmt = $this->db->prepare($sql);
        $stmt->execute(['user_id' => $userId, 'event_id' => $eventId]);
        return $stmt->fetch() ? true : false;
    }

    // Create booking with full details
=======
        $sql = "SELECT id FROM bookings WHERE user_id = :user_id AND event_id = :event_id LIMIT 1";
        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'user_id' => $userId,
            'event_id' => $eventId
        ]);

        return $stmt->fetch() ? true : false;
    }

    // Create booking
>>>>>>> d2592c2 (UI: Added frontend OTP verification interface and email OTP flow)
    public function create($userId, $eventId, $details = [])
    {
        $sql = "INSERT INTO bookings (
                    user_id, event_id, status, admin_note, event_type, package_name,
                    start_date, end_date, event_date, time_slot, guest_count,
                    special_request, extra_services, venue_price, package_price,
                    guest_price, services_price, total_price
                ) VALUES (
                    :user_id, :event_id, :status, :admin_note, :event_type, :package_name,
                    :start_date, :end_date, :event_date, :time_slot, :guest_count,
                    :special_request, :extra_services, :venue_price, :package_price,
                    :guest_price, :services_price, :total_price
                )";
<<<<<<< HEAD

        $stmt = $this->db->prepare($sql);
        $stmt->execute([
            'user_id'         => $userId,
            'event_id'        => $eventId,
            'status'          => $details['status']          ?? 'pending',
            'admin_note'      => $details['admin_note']      ?? null,
            'event_type'      => $details['event_type']      ?? null,
            'package_name'    => $details['package_name']    ?? null,
            'start_date'      => $details['start_date']      ?? null,
            'end_date'        => $details['end_date']        ?? null,
            'event_date'      => $details['event_date']      ?? null,
            'time_slot'       => $details['time_slot']       ?? null,
            'guest_count'     => $details['guest_count']     ?? 1,
            'special_request' => $details['special_request'] ?? null,
            'extra_services'  => $details['extra_services']  ?? null,
            'venue_price'     => $details['venue_price']     ?? 0,
            'package_price'   => $details['package_price']   ?? 0,
            'guest_price'     => $details['guest_price']     ?? 0,
            'services_price'  => $details['services_price']  ?? 0,
            'total_price'     => $details['total_price']     ?? 0,
=======
        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            'user_id' => $userId,
            'event_id' => $eventId,
            'status' => $details['status'] ?? 'pending',
            'admin_note' => $details['admin_note'] ?? null,
            'event_type' => $details['event_type'] ?? null,
            'package_name' => $details['package_name'] ?? null,
            'start_date' => $details['start_date'] ?? null,
            'end_date' => $details['end_date'] ?? null,
            'event_date' => $details['event_date'] ?? null,
            'time_slot' => $details['time_slot'] ?? null,
            'guest_count' => $details['guest_count'] ?? 1,
            'special_request' => $details['special_request'] ?? null,
            'extra_services' => $details['extra_services'] ?? null,
            'venue_price' => $details['venue_price'] ?? 0,
            'package_price' => $details['package_price'] ?? 0,
            'guest_price' => $details['guest_price'] ?? 0,
            'services_price' => $details['services_price'] ?? 0,
            'total_price' => $details['total_price'] ?? 0,
>>>>>>> d2592c2 (UI: Added frontend OTP verification interface and email OTP flow)
        ]);

        return $this->findById((int)$this->db->lastInsertId());
    }

    // Find booking by ID
    public function findById($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM bookings WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);

        $booking = $stmt->fetch() ?: null;
<<<<<<< HEAD
        if (!$booking) return null;

        $booking['id']             = (int)$booking['id'];
        $booking['user_id']        = (int)$booking['user_id'];
        $booking['event_id']       = (int)$booking['event_id'];
        $booking['guest_count']    = (int)($booking['guest_count']    ?? 1);
        $booking['venue_price']    = (float)($booking['venue_price']    ?? 0);
        $booking['package_price']  = (float)($booking['package_price']  ?? 0);
        $booking['guest_price']    = (float)($booking['guest_price']    ?? 0);
        $booking['services_price'] = (float)($booking['services_price'] ?? 0);
        $booking['total_price']    = (float)($booking['total_price']    ?? 0);
=======

        if (!$booking) {
            return null;
        }

        $booking['id'] = (int)$booking['id'];
        $booking['user_id'] = (int)$booking['user_id'];
        $booking['event_id'] = (int)$booking['event_id'];
        $booking['guest_count'] = (int)($booking['guest_count'] ?? 1);
        $booking['venue_price'] = (float)($booking['venue_price'] ?? 0);
        $booking['package_price'] = (float)($booking['package_price'] ?? 0);
        $booking['guest_price'] = (float)($booking['guest_price'] ?? 0);
        $booking['services_price'] = (float)($booking['services_price'] ?? 0);
        $booking['total_price'] = (float)($booking['total_price'] ?? 0);
>>>>>>> d2592c2 (UI: Added frontend OTP verification interface and email OTP flow)
        $booking['extra_services'] = $this->decodeExtraServices($booking['extra_services'] ?? null);

        return $booking;
    }

    // Delete booking by ID
    public function delete($id)
    {
        $stmt = $this->db->prepare("DELETE FROM bookings WHERE id = :id");
        $stmt->execute(['id' => $id]);
<<<<<<< HEAD
        return $stmt->rowCount() > 0;
    }

    // Update booking status and admin note (admin confirm/review)
=======

        return $stmt->rowCount() > 0;
    }

>>>>>>> d2592c2 (UI: Added frontend OTP verification interface and email OTP flow)
    public function updateReview($id, $status, $adminNote = null)
    {
        $stmt = $this->db->prepare(
            "UPDATE bookings SET status = :status, admin_note = :admin_note WHERE id = :id"
        );
<<<<<<< HEAD
        $stmt->execute([
            'id'         => $id,
            'status'     => $status,
            'admin_note' => $adminNote,
        ]);
=======

        $stmt->execute([
            'id' => $id,
            'status' => $status,
            'admin_note' => $adminNote,
        ]);

>>>>>>> d2592c2 (UI: Added frontend OTP verification interface and email OTP flow)
        return $this->findById($id);
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
<<<<<<< HEAD
        $results = $stmt->fetchAll();

        $bookings = [];
        foreach ($results as $row) {
            $bookings[] = [
                'id'             => (int)$row['id'],
                'status'         => $row['status']       ?? 'pending',
                'admin_note'     => $row['admin_note']   ?? null,
                'event_type'     => $row['event_type']   ?? null,
                'package_name'   => $row['package_name'] ?? null,
                'guest_count'    => (int)($row['guest_count']  ?? 1),
                'total_price'    => (float)($row['total_price'] ?? 0),
                'event_date'     => $row['event_date']   ?? null,
                'extra_services' => $this->decodeExtraServices($row['extra_services'] ?? null),
                'created_at'     => $row['created_at'],
                'event'          => [
                    'id'          => (int)$row['event_id'],
                    'title'       => $row['title'],
                    'description' => $row['description'],
                    'date'        => $row['date'],
                    'location'    => $row['location'],
                    'price'       => (float)$row['price'],
                    'image'       => $row['image']
=======

        $results = $stmt->fetchAll();

        $bookings = [];

        foreach ($results as $row) {
            $bookings[] = [
                'id' => (int)$row['id'],
                'status' => $row['status'] ?? 'pending',
                'admin_note' => $row['admin_note'] ?? null,
                'event_type' => $row['event_type'] ?? null,
                'package_name' => $row['package_name'] ?? null,
                'guest_count' => (int)($row['guest_count'] ?? 1),
                'total_price' => (float)($row['total_price'] ?? 0),
                'extra_services' => $this->decodeExtraServices($row['extra_services'] ?? null),
                'created_at' => $row['created_at'],
                'event' => [
                    'id' => (int)$row['event_id'],
                    'title' => $row['title'],
                    'description' => $row['description'],
                    'date' => $row['date'],
                    'location' => $row['location'],
                    'price' => (float)$row['price'],
                    'image' => $row['image']
>>>>>>> d2592c2 (UI: Added frontend OTP verification interface and email OTP flow)
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

<<<<<<< HEAD
        $stmt    = $this->db->query($sql);
        $results = $stmt->fetchAll();

        $bookings = [];
        foreach ($results as $row) {
            $bookings[] = [
                'id'           => (int)$row['id'],
                'status'       => $row['status']       ?? 'pending',
                'admin_note'   => $row['admin_note']   ?? null,
                'event_type'   => $row['event_type']   ?? null,
                'package_name' => $row['package_name'] ?? null,
                'guest_count'  => (int)($row['guest_count']  ?? 1),
                'total_price'  => (float)($row['total_price'] ?? 0),
                'created_at'   => $row['created_at'],
                'user'         => [
                    'id'    => (int)$row['user_id'],
                    'name'  => $row['name'],
                    'email' => $row['email']
                ],
                'event'        => [
                    'id'       => (int)$row['event_id'],
                    'title'    => $row['title'],
                    'date'     => $row['date'],
                    'location' => $row['location'],
                    'price'    => (float)$row['price']
=======
        $stmt = $this->db->query($sql);
        $results = $stmt->fetchAll();

        $bookings = [];

        foreach ($results as $row) {
            $bookings[] = [
                'id' => (int)$row['id'],
                'status' => $row['status'] ?? 'pending',
                'admin_note' => $row['admin_note'] ?? null,
                'event_type' => $row['event_type'] ?? null,
                'package_name' => $row['package_name'] ?? null,
                'guest_count' => (int)($row['guest_count'] ?? 1),
                'total_price' => (float)($row['total_price'] ?? 0),
                'extra_services' => $this->decodeExtraServices($row['extra_services'] ?? null),
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
>>>>>>> d2592c2 (UI: Added frontend OTP verification interface and email OTP flow)
                ]
            ];
        }

        return $bookings;
    }

<<<<<<< HEAD
    // Decode JSON-encoded extra services
    private function decodeExtraServices($value)
    {
        if (!$value) return [];
        $decoded = json_decode($value, true);
=======
    private function decodeExtraServices($value)
    {
        if (!$value) {
            return [];
        }

        $decoded = json_decode($value, true);

>>>>>>> d2592c2 (UI: Added frontend OTP verification interface and email OTP flow)
        return is_array($decoded) ? $decoded : [];
    }
}
