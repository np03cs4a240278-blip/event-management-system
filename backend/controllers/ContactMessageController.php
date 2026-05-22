<?php

class ContactMessageController
{
    private $contactMessages;

    public function __construct($contactMessages)
    {
        $this->contactMessages = $contactMessages;
    }

    // ── POST /contact-messages — public form submission ────────────────────
    public function store()
    {
        $data = getJsonInput();

        $name    = trim($data['name']    ?? '');
        $email   = trim($data['email']   ?? '');
        $message = trim($data['message'] ?? '');

        if ($name === '' || $email === '' || $message === '') {
            jsonResponse(['message' => 'Name, email, and message are required.'], 422);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            jsonResponse(['message' => 'Please enter a valid email address.'], 422);
        }

        if (strlen($name) > 100) {
            jsonResponse(['message' => 'Name is too long.'], 422);
        }

        if (strlen($email) > 150) {
            jsonResponse(['message' => 'Email is too long.'], 422);
        }

        $savedMessage = $this->contactMessages->create([
            'name'    => $name,
            'email'   => $email,
            'message' => $message,
        ]);

        jsonResponse([
            'message'         => 'Your message has been saved successfully.',
            'contact_message' => $savedMessage,
        ], 201);
    }

    // ── GET /contact-messages — admin: list all messages ──────────────────
    public function index()
    {
        requireAdmin();

        $messages = $this->contactMessages->all();
        $unread   = $this->contactMessages->countUnread();

        jsonResponse([
            'messages' => $messages,
            'unread'   => $unread,
        ]);
    }

    // ── PUT /contact-messages/:id/status — admin: update status ───────────
    public function updateStatus(int $id)
    {
        requireAdmin();

        $data   = getJsonInput();
        $status = trim($data['status'] ?? '');

        $allowed = ['new', 'read', 'replied'];
        if (!in_array($status, $allowed, true)) {
            jsonResponse(['message' => 'Invalid status. Must be: new, read, or replied.'], 422);
        }

        $updated = $this->contactMessages->updateStatus($id, $status);

        if (empty($updated)) {
            jsonResponse(['message' => 'Message not found.'], 404);
        }

        jsonResponse([
            'message'         => 'Status updated successfully.',
            'contact_message' => $updated,
        ]);
    }

    // ── DELETE /contact-messages/:id — admin: delete a message ────────────
    public function destroy(int $id)
    {
        requireAdmin();

        $deleted = $this->contactMessages->delete($id);

        if (!$deleted) {
            jsonResponse(['message' => 'Message not found.'], 404);
        }

        jsonResponse(['message' => 'Message deleted successfully.']);
    }

    // ── GET /contact-messages/unread-count — admin: badge count ───────────
    public function unreadCount()
    {
        requireAdmin();

        $count = $this->contactMessages->countUnread();
        jsonResponse(['unread' => $count]);
    }
}
