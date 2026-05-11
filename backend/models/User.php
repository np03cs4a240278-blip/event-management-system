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

        return $stmt->fetch() ?: null;
    }

    // Find user by ID
    public function findById($id)
    {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE id = :id LIMIT 1");
        $stmt->execute(['id' => $id]);

        return $stmt->fetch() ?: null;
    }

    public function allPublicUsers()
    {
        $stmt = $this->db->query("SELECT * FROM users ORDER BY created_at DESC, id DESC");
        $users = $stmt->fetchAll() ?: [];

        return array_map([$this, 'toPublicUser'], $users);
    }

    public function updateAccountStatus($id, $status)
    {
        $stmt = $this->db->prepare(
            "UPDATE users
             SET account_status = :account_status,
                 deactivated_at = :deactivated_at
             WHERE id = :id"
        );

        return $stmt->execute([
            'id' => $id,
            'account_status' => $status,
            'deactivated_at' => $status === 'deactivated' ? date('Y-m-d H:i:s') : null
        ]);
    }

    public function deleteById($id)
    {
        $stmt = $this->db->prepare("DELETE FROM users WHERE id = :id");

        return $stmt->execute(['id' => $id]);
    }

    // Create new user
    public function create($name, $email, $password, $role = 'user')
    {
        $stmt = $this->db->prepare(
            "INSERT INTO users (name, email, password, role) 
             VALUES (:name, :email, :password, :role)"
        );

        $stmt->execute([
            'name' => $name,
            'email' => $email,
            'password' => $password,
            'role' => $role
        ]);

        return $this->findById($this->db->lastInsertId());
    }

    // Update password by email
    public function updatePasswordByEmail($email, $password)
    {
        $stmt = $this->db->prepare(
            "UPDATE users SET password = :password WHERE email = :email"
        );

        return $stmt->execute([
            'email' => $email,
            'password' => $password
        ]);
    }

    // Update password by user ID
    public function updatePasswordById($id, $password)
    {
        $stmt = $this->db->prepare(
            "UPDATE users SET password = :password WHERE id = :id"
        );

        return $stmt->execute([
            'id' => $id,
            'password' => $password
        ]);
    }

    // Set must_change_password by email
    public function setMustChangePasswordByEmail($email, $value)
    {
        $stmt = $this->db->prepare(
            "UPDATE users SET must_change_password = :value WHERE email = :email"
        );

        return $stmt->execute([
            'email' => $email,
            'value' => $value ? 1 : 0
        ]);
    }

    // Set must_change_password by user ID
    public function setMustChangePasswordById($id, $value)
    {
        $stmt = $this->db->prepare(
            "UPDATE users SET must_change_password = :value WHERE id = :id"
        );

        return $stmt->execute([
            'id' => $id,
            'value' => $value ? 1 : 0
        ]);
    }

    // Return safe user data (without password)
    public function toPublicUser($user)
    {
        return [
            'id' => (int)$user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'account_status' => $user['account_status'] ?? 'active',
            'deactivated_at' => $user['deactivated_at'] ?? null,
            'role' => $user['role'],
            'must_change_password' => (bool)($user['must_change_password'] ?? 0),
            'created_at' => $user['created_at'] ?? null
        ];
    }
}
