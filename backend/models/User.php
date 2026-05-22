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
    public function create($name, $email, $password, $role = 'user', $isVerified = false)
    {
        $stmt = $this->db->prepare(
            "INSERT INTO users (
                name, email, password, role, is_verified, verified_at, otp_code_hash, otp_expires_at, otp_last_sent_at, otp_purpose
            ) VALUES (
                :name, :email, :password, :role, :is_verified, :verified_at, :otp_code_hash, :otp_expires_at, :otp_last_sent_at, :otp_purpose
            )"
        );

        $stmt->execute([
            'name' => $name,
            'email' => $email,
            'password' => $password,
            'role' => $role,
            'is_verified' => $isVerified ? 1 : 0,
            'verified_at' => $isVerified ? date('Y-m-d H:i:s') : null,
            'otp_code_hash' => null,
            'otp_expires_at' => null,
            'otp_last_sent_at' => null,
            'otp_purpose' => null,
        ]);

        return $this->findById($this->db->lastInsertId());
    }

    public function storeOtpChallenge($id, $otpPurpose, $otpCodeHash, $otpExpiresAt, $otpLastSentAt)
    {
        $stmt = $this->db->prepare(
            "UPDATE users
             SET otp_code_hash = :otp_code_hash,
                 otp_expires_at = :otp_expires_at,
                 otp_last_sent_at = :otp_last_sent_at,
                 otp_purpose = :otp_purpose
             WHERE id = :id"
        );

        return $stmt->execute([
            'id' => $id,
            'otp_purpose' => $otpPurpose,
            'otp_code_hash' => $otpCodeHash,
            'otp_expires_at' => $otpExpiresAt,
            'otp_last_sent_at' => $otpLastSentAt,
        ]);
    }

    public function clearOtpChallenge($id)
    {
        $stmt = $this->db->prepare(
            "UPDATE users
             SET otp_code_hash = NULL,
                 otp_expires_at = NULL,
                 otp_last_sent_at = NULL,
                 otp_purpose = NULL
             WHERE id = :id"
        );

        return $stmt->execute(['id' => $id]);
    }

    public function markAsVerified($id)
    {
        $stmt = $this->db->prepare(
            "UPDATE users
             SET is_verified = 1,
                 verified_at = :verified_at,
                 otp_code_hash = NULL,
                 otp_expires_at = NULL,
                 otp_last_sent_at = NULL,
                 otp_purpose = NULL
             WHERE id = :id"
        );

        return $stmt->execute([
            'id' => $id,
            'verified_at' => date('Y-m-d H:i:s'),
        ]);
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
            'is_verified' => (bool)($user['is_verified'] ?? 1),
            'verified_at' => $user['verified_at'] ?? null,
            'created_at' => $user['created_at'] ?? null
        ];
    }
}
