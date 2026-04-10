<?php

class BookingController
{
    private $bookings;
    private $events;

    // Constructor (runs when object is created)
    public function __construct($bookings, $events)
    {
        $this->bookings = $bookings;
        $this->events = $events;
    }

    // CREATE BOOKING
    public function store()
    {
        // Get logged-in user
        $user = requireAuth();

        // Admin cannot book events
        if (($user['role'] ?? 'user') === 'admin') {
            jsonResponse(['message' => 'Admin cannot create bookings'], 403);
        }

        // Get request data
        $data = getJsonInput();

        // Get event ID from request
        $eventId = isset($data['event_id']) ? (int)$data['event_id'] : 0;

        // Check if event_id is valid
        if ($eventId <= 0) {
            jsonResponse(['message' => 'Valid event_id required'], 422);
        }

        // Check if event exists
        $event = $this->events->findById($eventId);
        if (!$event) {
            jsonResponse(['message' => 'Event not found'], 404);
        }

        if (!empty($event['date']) && $event['date'] < date('Y-m-d')) {
            jsonResponse(['message' => 'Past events cannot be booked'], 422);
        }

        // Check if already booked
        $alreadyBooked = $this->bookings->existsForUserEvent($user['id'], $eventId);
        if ($alreadyBooked) {
            jsonResponse(['message' => 'Already booked this event'], 409);
        }

        // Create booking
        $booking = $this->bookings->create($user['id'], $eventId);

        // Return success response
        jsonResponse([
            'message' => 'Booking successful',
            'booking' => $booking
        ], 201);
    }

    // GET BOOKINGS OF CURRENT USER
    public function myBookings()
    {
        $user = requireAuth();

        $bookings = $this->bookings->userBookings($user['id']);

        jsonResponse([
            'bookings' => $bookings
        ]);
    }

    // CANCEL BOOKING
    public function destroy($id)
    {
        $user = requireAuth();

        if (($user['role'] ?? 'user') === 'admin') {
            jsonResponse(['message' => 'Admin cannot cancel bookings'], 403);
        }

        $booking = $this->bookings->findById((int)$id);

        if (!$booking) {
            jsonResponse(['message' => 'Booking not found'], 404);
        }

        if ((int)$booking['user_id'] !== (int)$user['id']) {
            jsonResponse(['message' => 'You can only cancel your own booking'], 403);
        }

        $this->bookings->delete((int)$id);

        jsonResponse([
            'message' => 'Booking cancelled successfully'
        ]);
    }

    // GET ALL BOOKINGS (ADMIN ONLY)
    public function allBookings()
    {
        requireAdmin();

        $bookings = $this->bookings->allBookings();

        jsonResponse([
            'bookings' => $bookings
        ]);
    }
}
