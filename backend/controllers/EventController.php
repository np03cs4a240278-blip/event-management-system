<?php

class EventController
{
    private $events;

    public function __construct($events)
    {
        $this->events = $events;
    }

    // GET ALL EVENTS
    public function index()
    {
        $search = $_GET['search'] ?? null;
        $location = $_GET['location'] ?? null;

        $events = $this->events->all($search, $location);

        jsonResponse(['events' => $events]);
    }

    // GET SINGLE EVENT
    public function show($id)
    {
        $event = $this->events->findById($id);

        if (!$event) {
            jsonResponse(['message' => 'Event not found'], 404);
        }

        jsonResponse(['event' => $event]);
    }

    // CREATE EVENT (ADMIN)
    public function store()
    {
        requireAdmin();

        $data = $this->validateEventData(getJsonInput());

        $event = $this->events->create($data);

        jsonResponse([
            'message' => 'Event created',
            'event' => $event
        ], 201);
    }

    // UPDATE EVENT (ADMIN)
    public function update($id)
    {
        requireAdmin();

        if (!$this->events->findById((int)$id)) {
            jsonResponse(['message' => 'Event not found'], 404);
        }

        $data = $this->validateEventData(getJsonInput());
        $event = $this->events->update((int)$id, $data);

        jsonResponse([
            'message' => 'Event updated',
            'event' => $event
        ]);
    }

    // DELETE EVENT (ADMIN)
    public function destroy($id)
    {
        requireAdmin();

        $deleted = $this->events->delete((int)$id);

        if (!$deleted) {
            jsonResponse(['message' => 'Event not found'], 404);
        }

        jsonResponse([
            'message' => 'Event deleted'
        ]);
    }

    private function validateEventData($data)
    {
        $title = trim($data['title'] ?? '');
        $description = trim($data['description'] ?? '');
        $date = trim($data['date'] ?? '');
        $location = trim($data['location'] ?? '');
        $image = trim($data['image'] ?? '');
        $price = $data['price'] ?? null;

        if ($title === '' || $description === '' || $date === '' || $location === '' || $price === null || $price === '') {
            jsonResponse(['message' => 'All fields except image are required'], 422);
        }

        if (strtotime($date) === false) {
            jsonResponse(['message' => 'Enter a valid event date'], 422);
        }

        if ($date < date('Y-m-d')) {
            jsonResponse(['message' => 'Event date cannot be in the past'], 422);
        }

        if (!is_numeric($price)) {
            jsonResponse(['message' => 'Price must be a valid number'], 422);
        }

        if ((float)$price < 0) {
            jsonResponse(['message' => 'Price cannot be negative'], 422);
        }

        return [
            'title' => $title,
            'description' => $description,
            'date' => $date,
            'location' => $location,
            'price' => (float)$price,
            'image' => $image,
        ];
    }
}
