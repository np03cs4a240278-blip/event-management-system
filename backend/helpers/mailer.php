<?php

function getBackendStorageDirectory(): string
{
    $storageDirectory = dirname(__DIR__) . '/storage';

    if (!is_dir($storageDirectory)) {
        mkdir($storageDirectory, 0777, true);
    }

    return $storageDirectory;
}

function getOtpMailLogPath(): string
{
    $preferredDirectory = getBackendStorageDirectory();

    if (is_dir($preferredDirectory) && is_writable($preferredDirectory)) {
        return $preferredDirectory . '/otp_mail.log';
    }

    $fallbackDirectory = rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'event-management-system';

    if (!is_dir($fallbackDirectory)) {
        @mkdir($fallbackDirectory, 0777, true);
    }

    if (is_dir($fallbackDirectory) && is_writable($fallbackDirectory)) {
        return $fallbackDirectory . DIRECTORY_SEPARATOR . 'otp_mail.log';
    }

    return rtrim(sys_get_temp_dir(), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'event_management_system_otp_mail.log';
}

function sendOtpEmail(string $toEmail, string $toName, string $otpCode, int $expiryMinutes, string $otpPurpose = 'email_verification'): array
{
    $isPasswordReset = $otpPurpose === 'password_reset';
    $subject = $isPasswordReset
        ? 'Your Event Management Password Reset OTP'
        : 'Your Event Management Email Verification OTP';
    $fromName = getenv('MAIL_FROM_NAME') ?: 'Event Management System';
    $fromEmail = getenv('MAIL_FROM_ADDRESS') ?: 'noreply@event-management.local';
    $recipientName = trim($toName) !== '' ? $toName : 'User';

    $message = implode("\n", [
        "Hello {$recipientName},",
        '',
        $isPasswordReset
            ? "Use this OTP code to reset your password: {$otpCode}"
            : "Use this OTP code to verify your email: {$otpCode}",
        "This code will expire in {$expiryMinutes} minutes.",
        '',
        'If you did not request this code, please ignore this message.',
        '',
        'Event Management System',
    ]);

    $headers = [
        'MIME-Version: 1.0',
        'Content-Type: text/plain; charset=UTF-8',
        "From: {$fromName} <{$fromEmail}>",
    ];

    $logPath = getOtpMailLogPath();
    $logEntry = implode("\n", [
        str_repeat('=', 60),
        'Sent at: ' . date('Y-m-d H:i:s'),
        'To: ' . $toEmail,
        'Subject: ' . $subject,
        'Purpose: ' . $otpPurpose,
        'OTP: ' . $otpCode,
        'Expires in: ' . $expiryMinutes . ' minutes',
        str_repeat('=', 60),
        '',
    ]);

    @file_put_contents($logPath, $logEntry, FILE_APPEND);

    $sent = @mail($toEmail, $subject, $message, implode("\r\n", $headers));

    if ($sent) {
        return [
            'delivery_mode' => 'email',
            'delivery_path' => $logPath,
        ];
    }

    return [
        'delivery_mode' => 'log',
        'delivery_path' => $logPath,
    ];
}
