<?php

class ContactMessageController
{
    private $contactMessages;

    public function __construct($contactMessages)
    {
        $this->contactMessages = $contactMessages;
    }

    public function store()
    {
        $data = getJsonInput();

        $name = trim($data['name'] ?? '');
        $email = trim($data['email'] ?? '');
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
            'name' => $name,
            'email' => $email,
            'message' => $message,
        ]);

        jsonResponse([
            'message' => 'Your message has been saved successfully.',
            'contact_message' => $savedMessage,
        ], 201);
    }
}
