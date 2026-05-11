<?php

class BookingController
{
    private $bookings;
    private $events;

    public function __construct($bookings, $events)
    {
        $this->bookings = $bookings;
        $this->events   = $events;
    }

    // CREATE BOOKING — POST /api/bookings
    public function store()
    {
        $user = requireAuth();

        // Admin cannot book events
        if (($user['role'] ?? 'user') === 'admin') {
            jsonResponse(['message' => 'Admin cannot create bookings'], 403);
        }

        $data    = getJsonInput();
        $eventId = isset($data['event_id']) ? (int)$data['event_id'] : 0;

        if ($eventId <= 0) {
            jsonResponse(['message' => 'Valid event_id required'], 422);
        }

        $event = $this->events->findById($eventId);
        if (!$event) {
            jsonResponse(['message' => 'Event not found'], 404);
        }

        if (!empty($event['date']) && $event['date'] < date('Y-m-d')) {
            jsonResponse(['message' => 'Past events cannot be booked'], 422);
        }

        if ($this->bookings->existsForUserEvent($user['id'], $eventId)) {
            jsonResponse(['message' => 'Already booked this event'], 409);
        }

        // Encode extra services array to JSON for storage
        $extraServices = $data['extra_services'] ?? [];
        if (is_array($extraServices)) {
            $extraServices = json_encode($extraServices);
        }

        $booking = $this->bookings->create($user['id'], $eventId, [
            'status'          => 'pending',
            'event_type'      => trim($data['event_type']      ?? ''),
            'package_name'    => trim($data['package_name']    ?? ''),
            'start_date'      => $data['start_date']           ?? null,
            'end_date'        => $data['end_date']             ?? null,
            'event_date'      => $data['event_date']           ?? null,
            'time_slot'       => trim($data['time_slot']       ?? ''),
            'guest_count'     => max(1, (int)($data['guest_count'] ?? 1)),
            'special_request' => trim($data['special_request'] ?? ''),
            'extra_services'  => $extraServices,
            'venue_price'     => isset($event['price']) ? (float)$event['price'] : 0,
            'package_price'   => (float)($data['package_price']  ?? 0),
            'guest_price'     => (float)($data['guest_price']    ?? 0),
            'services_price'  => (float)($data['services_price'] ?? 0),
            'total_price'     => (float)($data['total_price']    ?? 0),
        ]);

        jsonResponse(['message' => 'Booking successful', 'booking' => $booking], 201);
    }

    // GET CURRENT USER'S BOOKINGS — GET /api/my-bookings
    public function myBookings()
    {
        $user     = requireAuth();
        $bookings = $this->bookings->userBookings($user['id']);
        jsonResponse(['bookings' => $bookings]);
    }

    // CANCEL BOOKING — DELETE /api/bookings/{id}
    public function destroy($id)
    {
        $user    = requireAuth();
        $booking = $this->bookings->findById((int)$id);

        if (!$booking) {
            jsonResponse(['message' => 'Booking not found'], 404);
        }

        // Users can only cancel their own bookings; admins can cancel any
        if (($user['role'] ?? 'user') !== 'admin' && (int)$booking['user_id'] !== (int)$user['id']) {
            jsonResponse(['message' => 'You can only cancel your own booking'], 403);
        }

        $this->bookings->delete((int)$id);
        jsonResponse(['message' => 'Booking cancelled successfully']);
    }

    // GET ALL BOOKINGS — GET /api/all-bookings (admin only)
    public function allBookings()
    {
        requireAdmin();
        $bookings = $this->bookings->allBookings();
        jsonResponse(['bookings' => $bookings]);
    }

    // CONFIRM / UPDATE BOOKING — POST /api/bookings/{id}/confirm (admin only)
    public function update($id)
    {
        requireAdmin();

        $booking = $this->bookings->findById((int)$id);
        if (!$booking) {
            jsonResponse(['message' => 'Booking not found'], 404);
        }

        $data      = getJsonInput();
        $status    = strtolower(trim($data['status']     ?? 'confirmed'));
        $adminNote = trim($data['admin_note'] ?? '');

        if (!in_array($status, ['pending', 'confirmed', 'cancelled'], true)) {
            jsonResponse(['message' => 'Invalid booking status'], 422);
        }

        $updatedBooking = $this->bookings->updateReview(
            (int)$id,
            $status,
            $adminNote !== '' ? $adminNote : null
        );

        jsonResponse(['message' => 'Booking updated', 'booking' => $updatedBooking]);
    }
}
