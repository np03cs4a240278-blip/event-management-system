<?php

class AuthController
{
    private const OTP_EXPIRY_MINUTES = 10;
    private const OTP_RESEND_COOLDOWN_SECONDS = 60;
    private const OTP_PURPOSE_VERIFICATION = 'email_verification';
    private const OTP_PURPOSE_PASSWORD_RESET = 'password_reset';

    private $users;

    public function __construct($users)
    {
        $this->users = $users;
    }

    public function register()
    {
        $data = getJsonInput();

        $name = trim($data['name'] ?? '');
        $email = strtolower(trim($data['email'] ?? ''));
        $password = $data['password'] ?? '';

        if ($name === '' || $email === '' || $password === '') {
            jsonResponse(['message' => 'All fields are required'], 422);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            jsonResponse(['message' => 'Invalid email'], 422);
        }

        if (strlen($password) < 6) {
            jsonResponse(['message' => 'Password must be at least 6 characters'], 422);
        }

        $existingUser = $this->users->findByEmail($email);

        if ($existingUser) {
            jsonResponse(['message' => 'User already exists'], 409);
        }

        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $this->users->create($name, $email, $hashedPassword, 'user', true);

        jsonResponse([
            'message' => 'Account created successfully. You can login now.',
            'email' => $email,
        ], 201);
    }

    public function login()
    {
        $data = getJsonInput();

        $email = strtolower(trim($data['email'] ?? ''));
        $password = $data['password'] ?? '';

        if ($email === '' || $password === '') {
            jsonResponse(['message' => 'Email and password required'], 422);
        }

        $user = $this->users->findByEmail($email);

        if (!$user || !password_verify($password, $user['password'])) {
            jsonResponse(['message' => 'Invalid login'], 401);
        }

        if (($user['account_status'] ?? 'active') !== 'active') {
            jsonResponse(['message' => 'This account has been deactivated. Please contact the admin.'], 403);
        }

        $_SESSION['user'] = $this->users->toPublicUser($user);

        jsonResponse([
            'message' => 'Login successful',
            'user' => $_SESSION['user'],
        ]);
    }

    public function me()
    {
        $sessionUser = requireAuth();

        jsonResponse([
            'user' => $sessionUser,
        ]);
    }

    public function forgotPassword()
    {
        $data = getJsonInput();
        $email = strtolower(trim($data['email'] ?? ''));

        if ($email === '') {
            jsonResponse(['message' => 'Email is required'], 422);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            jsonResponse(['message' => 'Invalid email'], 422);
        }

        $user = $this->users->findByEmail($email);

        if (!$user) {
            jsonResponse(['message' => 'User not found'], 404);
        }

        if (($user['account_status'] ?? 'active') !== 'active') {
            jsonResponse(['message' => 'This account has been deactivated. Please contact the admin.'], 403);
        }

        $resetData = $this->prepareOtpChallenge($user, self::OTP_PURPOSE_PASSWORD_RESET);

        jsonResponse(array_merge([
            'message' => 'Password reset OTP has been sent to your email.',
            'requires_password_reset' => true,
            'email' => $user['email'],
            'otp_purpose' => self::OTP_PURPOSE_PASSWORD_RESET,
        ], $resetData));
    }

    public function resetPasswordWithOtp()
    {
        $data = getJsonInput();

        $email = strtolower(trim($data['email'] ?? ''));
        $otp = trim((string)($data['otp'] ?? ''));
        $newPassword = $data['new_password'] ?? '';
        $confirmPassword = $data['confirm_password'] ?? '';

        if ($email === '' || $otp === '' || $newPassword === '' || $confirmPassword === '') {
            jsonResponse(['message' => 'Email, OTP, new password, and confirm password are required.'], 422);
        }

        if (!preg_match('/^\d{6}$/', $otp)) {
            jsonResponse(['message' => 'Enter the 6-digit OTP code.'], 422);
        }

        if (strlen($newPassword) < 6) {
            jsonResponse(['message' => 'New password must be at least 6 characters.'], 422);
        }

        if ($newPassword !== $confirmPassword) {
            jsonResponse(['message' => 'New password and confirm password must match.'], 422);
        }

        $user = $this->users->findByEmail($email);

        if (!$user) {
            jsonResponse(['message' => 'User not found.'], 404);
        }

        if (($user['account_status'] ?? 'active') !== 'active') {
            jsonResponse(['message' => 'This account has been deactivated. Please contact the admin.'], 403);
        }

        if (!$this->hasOtpForPurpose($user, self::OTP_PURPOSE_PASSWORD_RESET)) {
            jsonResponse([
                'message' => 'Password reset OTP not found. Please request a new code.',
                'email' => $email,
                'otp_expired' => true,
            ], 410);
        }

        if ($this->isOtpExpired($user)) {
            $this->users->clearOtpChallenge($user['id']);

            jsonResponse([
                'message' => 'Password reset OTP expired. Please request a new code.',
                'email' => $email,
                'otp_expired' => true,
            ], 410);
        }

        $providedHash = hash('sha256', $otp);

        if (!hash_equals((string)$user['otp_code_hash'], $providedHash)) {
            jsonResponse(['message' => 'Invalid OTP. Please try again.'], 422);
        }

        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        $this->users->updatePasswordById($user['id'], $hashedPassword);
        $this->users->setMustChangePasswordById($user['id'], false);
        $this->users->clearOtpChallenge($user['id']);
        clearAuthSession();

        jsonResponse([
            'message' => 'Password reset successful. Please login with your new password.',
        ]);
    }

    public function changePassword()
    {
        $sessionUser = requireAuth();
        $data = getJsonInput();

        $currentPassword = $data['current_password'] ?? '';
        $newPassword = $data['new_password'] ?? '';
        $confirmPassword = $data['confirm_password'] ?? '';

        if ($currentPassword === '' || $newPassword === '' || $confirmPassword === '') {
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
            'user' => $_SESSION['user'],
        ]);
    }

    public function logout()
    {
        clearAuthSession();
        jsonResponse(['message' => 'Logged out']);
    }

    public function verifyOtp()
    {
        $data = getJsonInput();

        $email = strtolower(trim($data['email'] ?? ''));
        $otp = trim((string)($data['otp'] ?? ''));

        if ($email === '' || $otp === '') {
            jsonResponse(['message' => 'Email and OTP are required.'], 422);
        }

        if (!preg_match('/^\d{6}$/', $otp)) {
            jsonResponse(['message' => 'Enter the 6-digit OTP code.'], 422);
        }

        $user = $this->users->findByEmail($email);

        if (!$user) {
            jsonResponse(['message' => 'User not found.'], 404);
        }

        if (($user['account_status'] ?? 'active') !== 'active') {
            jsonResponse(['message' => 'This account has been deactivated. Please contact the admin.'], 403);
        }

        if ($this->isUserVerified($user)) {
            jsonResponse(['message' => 'This account is already verified. Please login.'], 409);
        }

        if (!$this->hasOtpForPurpose($user, self::OTP_PURPOSE_VERIFICATION)) {
            jsonResponse([
                'message' => 'OTP not found. Please resend a new code.',
                'email' => $email,
                'otp_expired' => true,
            ], 410);
        }

        if ($this->isOtpExpired($user)) {
            $this->users->clearOtpChallenge($user['id']);

            jsonResponse([
                'message' => 'OTP expired. Please resend a new code.',
                'email' => $email,
                'otp_expired' => true,
            ], 410);
        }

        $providedHash = hash('sha256', $otp);

        if (!hash_equals((string)$user['otp_code_hash'], $providedHash)) {
            jsonResponse(['message' => 'Invalid OTP. Please try again.'], 422);
        }

        $this->users->markAsVerified($user['id']);
        $verifiedUser = $this->users->findById($user['id']);
        $_SESSION['user'] = $this->users->toPublicUser($verifiedUser);

        jsonResponse([
            'message' => 'OTP verified successfully. You are now logged in.',
            'user' => $_SESSION['user'],
        ]);
    }

    public function resendOtp()
    {
        $data = getJsonInput();
        $email = strtolower(trim($data['email'] ?? ''));
        $purpose = $this->normalizeOtpPurpose($data['purpose'] ?? self::OTP_PURPOSE_VERIFICATION);

        if ($email === '') {
            jsonResponse(['message' => 'Email is required.'], 422);
        }

        $user = $this->users->findByEmail($email);

        if (!$user) {
            jsonResponse(['message' => 'User not found.'], 404);
        }

        if (($user['account_status'] ?? 'active') !== 'active') {
            jsonResponse(['message' => 'This account has been deactivated. Please contact the admin.'], 403);
        }

        if ($purpose === self::OTP_PURPOSE_VERIFICATION && $this->isUserVerified($user)) {
            jsonResponse(['message' => 'This account is already verified. Please login.'], 409);
        }

        if ($this->hasActiveOtp($user) && $this->getOtpPurpose($user) === $purpose && !$this->canResendOtp($user)) {
            jsonResponse([
                'message' => 'Please wait before requesting a new OTP.',
                'email' => $user['email'],
                'otp_purpose' => $purpose,
                'expires_at' => $user['otp_expires_at'],
                'expires_in_seconds' => $this->getOtpSecondsRemaining($user),
                'resend_available_at' => $this->getResendAvailableAt($user),
                'resend_in_seconds' => $this->getResendSecondsRemaining($user),
                'delivery_mode' => 'existing',
                'delivery_path' => null,
            ], 429);
        }

        $otpData = $this->issueOtpChallenge($user, $purpose);

        jsonResponse(array_merge([
            'message' => $purpose === self::OTP_PURPOSE_PASSWORD_RESET
                ? 'A new password reset OTP has been sent successfully.'
                : 'A new OTP has been sent successfully.',
            'email' => $user['email'],
            'otp_purpose' => $purpose,
        ], $otpData));
    }

    private function prepareOtpChallenge($user, $purpose)
    {
        if ($this->hasActiveOtp($user) && $this->getOtpPurpose($user) === $purpose && !$this->canResendOtp($user)) {
            return [
                'otp_purpose' => $purpose,
                'expires_at' => $user['otp_expires_at'],
                'expires_in_seconds' => $this->getOtpSecondsRemaining($user),
                'resend_available_at' => $this->getResendAvailableAt($user),
                'resend_in_seconds' => $this->getResendSecondsRemaining($user),
                'delivery_mode' => 'existing',
                'delivery_path' => null,
            ];
        }

        return $this->issueOtpChallenge($user, $purpose);
    }

    private function issueOtpChallenge($user, $purpose)
    {
        $otpCode = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $otpCodeHash = hash('sha256', $otpCode);
        $otpExpiresAt = date('Y-m-d H:i:s', time() + (self::OTP_EXPIRY_MINUTES * 60));
        $otpLastSentAt = date('Y-m-d H:i:s');

        $this->users->storeOtpChallenge($user['id'], $purpose, $otpCodeHash, $otpExpiresAt, $otpLastSentAt);

        $delivery = sendOtpEmail(
            $user['email'],
            $user['name'] ?? 'User',
            $otpCode,
            self::OTP_EXPIRY_MINUTES,
            $purpose
        );

        return [
            'otp_purpose' => $purpose,
            'expires_at' => $otpExpiresAt,
            'expires_in_seconds' => self::OTP_EXPIRY_MINUTES * 60,
            'resend_available_at' => date('Y-m-d H:i:s', strtotime($otpLastSentAt) + self::OTP_RESEND_COOLDOWN_SECONDS),
            'resend_in_seconds' => self::OTP_RESEND_COOLDOWN_SECONDS,
            'delivery_mode' => $delivery['delivery_mode'] ?? 'email',
            'delivery_path' => $delivery['delivery_path'] ?? null,
        ];
    }

    private function isUserVerified($user)
    {
        return (bool)($user['is_verified'] ?? 1);
    }

    private function hasOtpForPurpose($user, $purpose)
    {
        return !empty($user['otp_code_hash'])
            && !empty($user['otp_expires_at'])
            && $this->getOtpPurpose($user) === $purpose;
    }

    private function hasActiveOtp($user)
    {
        return !empty($user['otp_code_hash'])
            && !empty($user['otp_expires_at'])
            && !$this->isOtpExpired($user);
    }

    private function getOtpPurpose($user)
    {
        $purpose = strtolower(trim((string)($user['otp_purpose'] ?? '')));

        if ($purpose === self::OTP_PURPOSE_PASSWORD_RESET) {
            return self::OTP_PURPOSE_PASSWORD_RESET;
        }

        return self::OTP_PURPOSE_VERIFICATION;
    }

    private function normalizeOtpPurpose($purpose)
    {
        return strtolower(trim((string)$purpose)) === self::OTP_PURPOSE_PASSWORD_RESET
            ? self::OTP_PURPOSE_PASSWORD_RESET
            : self::OTP_PURPOSE_VERIFICATION;
    }

    private function isOtpExpired($user)
    {
        if (empty($user['otp_expires_at'])) {
            return true;
        }

        $expiresAt = strtotime((string)$user['otp_expires_at']);

        return $expiresAt === false || $expiresAt <= time();
    }

    private function canResendOtp($user)
    {
        if (empty($user['otp_last_sent_at'])) {
            return true;
        }

        $lastSentAt = strtotime((string)$user['otp_last_sent_at']);

        if ($lastSentAt === false) {
            return true;
        }

        return $lastSentAt + self::OTP_RESEND_COOLDOWN_SECONDS <= time();
    }

    private function getResendAvailableAt($user)
    {
        if (empty($user['otp_last_sent_at'])) {
            return date('Y-m-d H:i:s');
        }

        $lastSentAt = strtotime((string)$user['otp_last_sent_at']);

        if ($lastSentAt === false) {
            return date('Y-m-d H:i:s');
        }

        return date('Y-m-d H:i:s', $lastSentAt + self::OTP_RESEND_COOLDOWN_SECONDS);
    }

    private function getOtpSecondsRemaining($user)
    {
        if (empty($user['otp_expires_at'])) {
            return 0;
        }

        $expiresAt = strtotime((string)$user['otp_expires_at']);

        if ($expiresAt === false) {
            return 0;
        }

        return max(0, $expiresAt - time());
    }

    private function getResendSecondsRemaining($user)
    {
        if (empty($user['otp_last_sent_at'])) {
            return 0;
        }

        $lastSentAt = strtotime((string)$user['otp_last_sent_at']);

        if ($lastSentAt === false) {
            return 0;
        }

        return max(0, ($lastSentAt + self::OTP_RESEND_COOLDOWN_SECONDS) - time());
    }
}
