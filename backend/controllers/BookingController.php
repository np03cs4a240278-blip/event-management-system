<?php

class BookingController
{
    private $bookings;
    private $events;

<<<<<<< HEAD
    public function __construct($bookings, $events)
    {
        $this->bookings = $bookings;
        $this->events   = $events;
    }

    // CREATE BOOKING — POST /api/bookings
    public function store()
    {
=======
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
>>>>>>> d2592c2 (UI: Added frontend OTP verification interface and email OTP flow)
        $user = requireAuth();

        // Admin cannot book events
        if (($user['role'] ?? 'user') === 'admin') {
            jsonResponse(['message' => 'Admin cannot create bookings'], 403);
        }

<<<<<<< HEAD
        $data    = getJsonInput();
        $eventId = isset($data['event_id']) ? (int)$data['event_id'] : 0;

=======
        // Get request data
        $data = getJsonInput();

        // Get event ID from request
        $eventId = isset($data['event_id']) ? (int)$data['event_id'] : 0;

        // Check if event_id is valid
>>>>>>> d2592c2 (UI: Added frontend OTP verification interface and email OTP flow)
        if ($eventId <= 0) {
            jsonResponse(['message' => 'Valid event_id required'], 422);
        }

<<<<<<< HEAD
=======
        // Check if event exists
>>>>>>> d2592c2 (UI: Added frontend OTP verification interface and email OTP flow)
        $event = $this->events->findById($eventId);
        if (!$event) {
            jsonResponse(['message' => 'Event not found'], 404);
        }

        if (!empty($event['date']) && $event['date'] < date('Y-m-d')) {
            jsonResponse(['message' => 'Past events cannot be booked'], 422);
        }

<<<<<<< HEAD
        if ($this->bookings->existsForUserEvent($user['id'], $eventId)) {
            jsonResponse(['message' => 'Already booked this event'], 409);
        }

        // Encode extra services array to JSON for storage
=======
        // Check if already booked
        $alreadyBooked = $this->bookings->existsForUserEvent($user['id'], $eventId);
        if ($alreadyBooked) {
            jsonResponse(['message' => 'Already booked this event'], 409);
        }

>>>>>>> d2592c2 (UI: Added frontend OTP verification interface and email OTP flow)
        $extraServices = $data['extra_services'] ?? [];
        if (is_array($extraServices)) {
            $extraServices = json_encode($extraServices);
        }

        $booking = $this->bookings->create($user['id'], $eventId, [
<<<<<<< HEAD
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
=======
            'status' => $data['status'] ?? 'pending',
            'event_type' => trim($data['event_type'] ?? ''),
            'package_name' => trim($data['package_name'] ?? ''),
            'start_date' => $data['start_date'] ?? null,
            'end_date' => $data['end_date'] ?? null,
            'event_date' => $data['event_date'] ?? null,
            'time_slot' => trim($data['time_slot'] ?? ''),
            'guest_count' => max(1, (int)($data['guest_count'] ?? 1)),
            'special_request' => trim($data['special_request'] ?? ''),
            'extra_services' => $extraServices,
            'venue_price' => isset($event['price']) ? (float)$event['price'] : 0,
            'package_price' => (float)($data['package_price'] ?? 0),
            'guest_price' => (float)($data['guest_price'] ?? 0),
            'services_price' => (float)($data['services_price'] ?? 0),
            'total_price' => (float)($data['total_price'] ?? 0),
        ]);

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

>>>>>>> d2592c2 (UI: Added frontend OTP verification interface and email OTP flow)
        $booking = $this->bookings->findById((int)$id);

        if (!$booking) {
            jsonResponse(['message' => 'Booking not found'], 404);
        }

<<<<<<< HEAD
        // Users can only cancel their own bookings; admins can cancel any
=======
>>>>>>> d2592c2 (UI: Added frontend OTP verification interface and email OTP flow)
        if (($user['role'] ?? 'user') !== 'admin' && (int)$booking['user_id'] !== (int)$user['id']) {
            jsonResponse(['message' => 'You can only cancel your own booking'], 403);
        }

        $this->bookings->delete((int)$id);
<<<<<<< HEAD
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
=======

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

>>>>>>> d2592c2 (UI: Added frontend OTP verification interface and email OTP flow)
    public function update($id)
    {
        requireAdmin();

        $booking = $this->bookings->findById((int)$id);
<<<<<<< HEAD
=======

>>>>>>> d2592c2 (UI: Added frontend OTP verification interface and email OTP flow)
        if (!$booking) {
            jsonResponse(['message' => 'Booking not found'], 404);
        }

<<<<<<< HEAD
        $data      = getJsonInput();
        $status    = strtolower(trim($data['status']     ?? 'confirmed'));
=======
        $data = getJsonInput();
        $status = strtolower(trim($data['status'] ?? 'confirmed'));
>>>>>>> d2592c2 (UI: Added frontend OTP verification interface and email OTP flow)
        $adminNote = trim($data['admin_note'] ?? '');

        if (!in_array($status, ['pending', 'confirmed', 'cancelled'], true)) {
            jsonResponse(['message' => 'Invalid booking status'], 422);
        }

<<<<<<< HEAD
        $updatedBooking = $this->bookings->updateReview(
            (int)$id,
            $status,
            $adminNote !== '' ? $adminNote : null
        );

        jsonResponse(['message' => 'Booking updated', 'booking' => $updatedBooking]);
=======
        $updatedBooking = $this->bookings->updateReview((int)$id, $status, $adminNote !== '' ? $adminNote : null);

        jsonResponse([
            'message' => 'Booking updated',
            'booking' => $updatedBooking
        ]);
>>>>>>> d2592c2 (UI: Added frontend OTP verification interface and email OTP flow)
    }
}
