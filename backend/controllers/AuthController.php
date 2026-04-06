<?php

class AuthController
{
    private $users;

    // Constructor (runs when class is created)
    public function __construct($users)
    {
        $this->users = $users;
    }

    // REGISTER USER
    public function register()
    {
        $data = getJsonInput();

        $name = trim($data['name'] ?? '');
        $email = strtolower(trim($data['email'] ?? ''));
        $password = $data['password'] ?? '';

        // Validation
        if ($name == '' || $email == '' || $password == '') {
            jsonResponse(['message' => 'All fields are required'], 422);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            jsonResponse(['message' => 'Invalid email'], 422);
        }

        if (strlen($password) < 6) {
            jsonResponse(['message' => 'Password must be at least 6 characters'], 422);
        }

        // Check if user already exists
        if ($this->users->findByEmail($email)) {
            jsonResponse(['message' => 'User already exists'], 409);
        }

        // Hash password
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

        // Save user
        $this->users->create($name, $email, $hashedPassword);

        jsonResponse(['message' => 'Registered successfully'], 201);
    }

    // LOGIN USER
    public function login()
    {
        $data = getJsonInput();

        $email = strtolower(trim($data['email'] ?? ''));
        $password = $data['password'] ?? '';

        if ($email == '' || $password == '') {
            jsonResponse(['message' => 'Email and password required'], 422);
        }

        $user = $this->users->findByEmail($email);

        // Check password
        if (!$user || !password_verify($password, $user['password'])) {
            jsonResponse(['message' => 'Invalid login'], 401);
        }

        // Save user in session
        $_SESSION['user'] = $this->users->toPublicUser($user);

        jsonResponse([
            'message' => 'Login successful',
            'user' => $_SESSION['user']
        ]);
    }

    // CURRENT USER
    public function me()
    {
        $sessionUser = getAuthenticatedUser();

        if (!$sessionUser || empty($sessionUser['id'])) {
            jsonResponse(['message' => 'Authentication required'], 401);
        }

        $user = $this->users->findById($sessionUser['id']);

        if (!$user) {
            session_destroy();
            jsonResponse(['message' => 'User not found'], 404);
        }

        $_SESSION['user'] = $this->users->toPublicUser($user);

        jsonResponse([
            'user' => $_SESSION['user']
        ]);
    }

    // FORGOT PASSWORD
    public function forgotPassword()
    {
        $data = getJsonInput();
        $email = strtolower(trim($data['email'] ?? ''));

        if ($email == '') {
            jsonResponse(['message' => 'Email is required'], 422);
        }

        $user = $this->users->findByEmail($email);

        if (!$user) {
            jsonResponse(['message' => 'User not found'], 404);
        }

        $defaultPassword = $this->generateTemporaryPassword();
        $hashedPassword = password_hash($defaultPassword, PASSWORD_DEFAULT);

        $this->users->updatePasswordByEmail($email, $hashedPassword);
        $this->users->setMustChangePasswordByEmail($email, true);

        jsonResponse([
            'message' => 'Password reset successful',
            'default_password' => $defaultPassword
        ]);
    }

    // CHANGE PASSWORD
    public function changePassword()
    {
        $sessionUser = requireAuth();
        $data = getJsonInput();

        $currentPassword = $data['current_password'] ?? '';
        $newPassword = $data['new_password'] ?? '';
        $confirmPassword = $data['confirm_password'] ?? '';

        if ($currentPassword == '' || $newPassword == '' || $confirmPassword == '') {
            jsonResponse(['message' => 'All password fields are required'], 422);
        }

        if (strlen($newPassword) < 6) {
            jsonResponse(['message' => 'New password must be at least 6 characters'], 422);
        }

        if ($newPassword !== $confirmPassword) {
            jsonResponse(['message' => 'New password and confirm password must match'], 422);
        }

        $user = $this->users->findById($sessionUser['id']);

        if (!$user) {
            jsonResponse(['message' => 'User not found'], 404);
        }

        if (!password_verify($currentPassword, $user['password'])) {
            jsonResponse(['message' => 'Current password is incorrect'], 422);
        }

        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

        $this->users->updatePasswordById($user['id'], $hashedPassword);
        $this->users->setMustChangePasswordById($user['id'], false);

        $updatedUser = $this->users->findById($user['id']);
        $_SESSION['user'] = $this->users->toPublicUser($updatedUser);

        jsonResponse([
            'message' => 'Password changed successfully',
            'user' => $_SESSION['user']
        ]);
    }

    // LOGOUT
    public function logout()
    {
        $_SESSION = [];
        session_destroy();
        jsonResponse(['message' => 'Logged out']);
    }

    private function generateTemporaryPassword()
    {
        $characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        $password = '';
        $lastIndex = strlen($characters) - 1;

        for ($i = 0; $i < 8; $i++) {
            $password .= $characters[random_int(0, $lastIndex)];
        }

        return $password;
    }
}
