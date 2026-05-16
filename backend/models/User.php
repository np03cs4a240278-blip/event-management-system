<?php

class User
{
    private $db;

    public function __construct($database)
    {
        $this->db = $database;
    }

    // Find user by email
    public function findByEmail($email)
    {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = :email LIMIT 1");
        $stmt->execute(['email' => $email]);
<<<<<<< HEAD
=======

>>>>>>> d2592c2 (UI: Added frontend OTP verification interface and email OTP flow)
        return $stmt->fetch() ?: null;
    }

    // Find user by ID
    public function findById($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);
<<<<<<< HEAD
        return $stmt->fetch() ?: null;
    }

    // Get all users (admin use)
=======

        return $stmt->fetch() ?: null;
    }

>>>>>>> d2592c2 (UI: Added frontend OTP verification interface and email OTP flow)
    public function allPublicUsers()
    {
        $stmt = $this->db->query("SELECT * FROM users ORDER BY created_at DESC, id DESC");
        $users = $stmt->fetchAll() ?: [];
<<<<<<< HEAD
=======

>>>>>>> d2592c2 (UI: Added frontend OTP verification interface and email OTP flow)
        return array_map([$this, 'toPublicUser'], $users);
    }

    // Create new user
    public function create($name, $email, $password, $role = 'user')
    {
        $stmt = $this->db->prepare(
<<<<<<< HEAD
            "INSERT INTO users (name, email, password, role)
             VALUES (:name, :email, :password, :role)"
        );
        $stmt->execute([
            'name'     => $name,
            'email'    => $email,
            'password' => $password,
            'role'     => $role
        ]);
=======
            "INSERT INTO users (name, email, password, role) 
             VALUES (:name, :email, :password, :role)"
        );

        $stmt->execute([
            'name' => $name,
            'email' => $email,
            'password' => $password,
            'role' => $role
        ]);

>>>>>>> d2592c2 (UI: Added frontend OTP verification interface and email OTP flow)
        return $this->findById($this->db->lastInsertId());
    }

    // Update password by email
    public function updatePasswordByEmail($email, $password)
    {
        $stmt = $this->db->prepare(
            "UPDATE users SET password = :password WHERE email = :email"
        );
<<<<<<< HEAD
        return $stmt->execute(['email' => $email, 'password' => $password]);
=======

        return $stmt->execute([
            'email' => $email,
            'password' => $password
        ]);
>>>>>>> d2592c2 (UI: Added frontend OTP verification interface and email OTP flow)
    }

    // Update password by user ID
    public function updatePasswordById($id, $password)
    {
        $stmt = $this->db->prepare(
            "UPDATE users SET password = :password WHERE id = :id"
        );
<<<<<<< HEAD
        return $stmt->execute(['id' => $id, 'password' => $password]);
=======

        return $stmt->execute([
            'id' => $id,
            'password' => $password
        ]);
>>>>>>> d2592c2 (UI: Added frontend OTP verification interface and email OTP flow)
    }

    // Set must_change_password by email
    public function setMustChangePasswordByEmail($email, $value)
    {
        $stmt = $this->db->prepare(
            "UPDATE users SET must_change_password = :value WHERE email = :email"
        );
<<<<<<< HEAD
        return $stmt->execute(['email' => $email, 'value' => $value ? 1 : 0]);
=======

        return $stmt->execute([
            'email' => $email,
            'value' => $value ? 1 : 0
        ]);
>>>>>>> d2592c2 (UI: Added frontend OTP verification interface and email OTP flow)
    }

    // Set must_change_password by user ID
    public function setMustChangePasswordById($id, $value)
    {
        $stmt = $this->db->prepare(
            "UPDATE users SET must_change_password = :value WHERE id = :id"
        );
<<<<<<< HEAD
        return $stmt->execute(['id' => $id, 'value' => $value ? 1 : 0]);
=======

        return $stmt->execute([
            'id' => $id,
            'value' => $value ? 1 : 0
        ]);
>>>>>>> d2592c2 (UI: Added frontend OTP verification interface and email OTP flow)
    }

    // Return safe user data (without password)
    public function toPublicUser($user)
    {
        return [
<<<<<<< HEAD
            'id'                   => (int)$user['id'],
            'name'                 => $user['name'],
            'email'                => $user['email'],
            'role'                 => $user['role'],
            'must_change_password' => (bool)($user['must_change_password'] ?? 0),
            'created_at'           => $user['created_at'] ?? null
=======
            'id' => (int)$user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'role' => $user['role'],
            'must_change_password' => (bool)($user['must_change_password'] ?? 0),
            'created_at' => $user['created_at'] ?? null
>>>>>>> d2592c2 (UI: Added frontend OTP verification interface and email OTP flow)
        ];
    }
}
