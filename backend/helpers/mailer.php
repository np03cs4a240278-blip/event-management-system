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

function isTruthyEnvFlag(string $key, bool $default = false): bool
{
    $value = getenv($key);

    if ($value === false) {
        return $default;
    }

    return in_array(strtolower(trim((string)$value)), ['1', 'true', 'yes', 'on'], true);
}

function isPlaceholderSmtpValue(string $value): bool
{
    $normalized = strtolower(trim($value));

    return $normalized === ''
        || in_array($normalized, ['your@gmail.com', 'your_gmail_app_password'], true);
}

function sendOtpEmail(string $toEmail, string $toName, string $otpCode, int $expiryMinutes, string $otpPurpose = 'email_verification'): array
{
    $isPasswordReset = $otpPurpose === 'password_reset';
    $subject = $isPasswordReset
        ? 'Your Event Management Password Reset OTP'
        : 'Your Event Management Email Verification OTP';
    $smtpUsername = trim((string)(getenv('SMTP_USERNAME') ?: ''));
    $fromName = getenv('MAIL_FROM_NAME') ?: 'Event Management System';
    $fromEmail = trim((string)(getenv('MAIL_FROM_ADDRESS') ?: ''));
    if ($fromEmail === '') {
        $fromEmail = $smtpUsername !== '' ? $smtpUsername : 'noreply@event-management-system.com';
    }
    $replyTo = getenv('MAIL_REPLY_TO') ?: $fromEmail;
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
        "Reply-To: {$fromName} <{$replyTo}>",
    ];

    $logPath = getOtpMailLogPath();
    $logLines = [
        str_repeat('=', 60),
        'Sent at: ' . date('Y-m-d H:i:s'),
        'To: ' . $toEmail,
        'Subject: ' . $subject,
        'Purpose: ' . $otpPurpose,
        'Expires in: ' . $expiryMinutes . ' minutes',
    ];

    $sent = false;
    $sendMethod = 'log_only';
    $errorDetails = null;
    $phpMailError = null;
    $smtpConfigured = trim((string)(getenv('SMTP_HOST') ?: '')) !== '';

    if ($smtpConfigured) {
        $sendMethod = 'smtp';
        $smtpResult = sendEmailViaSmtp($toEmail, $subject, $message, $fromName, $fromEmail, $headers);
        $sent = $smtpResult['sent'] ?? false;
        $errorDetails = $smtpResult['error'] ?? null;
    }

    if (!$sent && isTruthyEnvFlag('MAIL_ALLOW_PHP_FALLBACK', false)) {
        $sendMethod = 'php_mail';
        $sent = @mail($toEmail, $subject, $message, implode("\r\n", $headers));
        $phpMailError = error_get_last();

        if (!$sent && $errorDetails === null && $phpMailError) {
            $errorDetails = $phpMailError['message'] ?? 'PHP mail fallback failed.';
        }
    }

    if (!$sent || isTruthyEnvFlag('OTP_LOG_CODES', false)) {
        $logLines[] = 'OTP: ' . $otpCode;
    }

    if ($errorDetails) {
        $logLines[] = 'Delivery error: ' . $errorDetails;
    }

    $logLines[] = 'Send method: ' . $sendMethod;
    $logLines[] = 'Mail status: ' . ($sent ? 'success' : 'failure');

    if ($phpMailError) {
        $logLines[] = 'PHP mail last error: ' . json_encode($phpMailError);
    }

    $logLines[] = str_repeat('=', 60);
    $logLines[] = '';

    @file_put_contents($logPath, implode("\n", $logLines), FILE_APPEND);

    if ($sent) {
        return [
            'delivery_mode' => 'email',
            'delivery_path' => null,
            'delivery_error' => null,
            'send_method' => $sendMethod,
        ];
    }

    return [
        'delivery_mode' => 'log',
        'delivery_path' => $logPath,
        'delivery_error' => $errorDetails,
        'send_method' => $sendMethod,
    ];
}

function sendEmailViaSmtp(string $toEmail, string $subject, string $body, string $fromName, string $fromEmail, array $headers): array
{
    $smtpHost = trim((string)(getenv('SMTP_HOST') ?: ''));
    $smtpPort = (int)(getenv('SMTP_PORT') ?: 587);
    $smtpUser = trim((string)(getenv('SMTP_USERNAME') ?: ''));
    $smtpPass = trim((string)(getenv('SMTP_PASSWORD') ?: ''));
    $smtpEncryption = strtolower(trim((string)(getenv('SMTP_ENCRYPTION') ?: 'tls')));

    if ($smtpHost === '') {
        return ['sent' => false, 'error' => 'SMTP host is not configured.'];
    }

    if (isPlaceholderSmtpValue($smtpUser)) {
        return ['sent' => false, 'error' => 'SMTP username is missing or still using the placeholder value.'];
    }

    if (isPlaceholderSmtpValue($smtpPass)) {
        return ['sent' => false, 'error' => 'SMTP password is missing or still using the placeholder value. For Gmail, use a 16-character App Password.'];
    }

    if (!filter_var($fromEmail, FILTER_VALIDATE_EMAIL)) {
        return ['sent' => false, 'error' => 'MAIL_FROM_ADDRESS is not a valid email address.'];
    }

    if (!in_array($smtpEncryption, ['tls', 'ssl', 'none'], true)) {
        return ['sent' => false, 'error' => 'SMTP encryption must be tls, ssl, or none.'];
    }

    $remoteSocket = ($smtpEncryption === 'ssl' ? 'ssl://' : 'tcp://') . $smtpHost . ':' . $smtpPort;
    $socket = @stream_socket_client($remoteSocket, $errno, $errstr, 30, STREAM_CLIENT_CONNECT);

    if (!$socket) {
        return ['sent' => false, 'error' => "Connection failed: {$errno} {$errstr}"];
    }

    stream_set_timeout($socket, 30);
    $response = smtpReadResponse($socket);
    if (strpos($response, '220') !== 0) {
        fclose($socket);
        return ['sent' => false, 'error' => "SMTP connect failed: {$response}"];
    }

    $hostname = gethostname() ?: 'localhost';
    $response = smtpSendCommand($socket, "EHLO {$hostname}");
    if (strpos($response, '250') !== 0) {
        fclose($socket);
        return ['sent' => false, 'error' => "EHLO failed: {$response}"];
    }

    if ($smtpEncryption === 'tls') {
        $response = smtpSendCommand($socket, 'STARTTLS');
        if (strpos($response, '220') !== 0) {
            fclose($socket);
            return ['sent' => false, 'error' => "STARTTLS failed: {$response}"];
        }

        if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            fclose($socket);
            return ['sent' => false, 'error' => 'Unable to enable TLS encryption'];
        }

        $response = smtpSendCommand($socket, "EHLO {$hostname}");
        if (strpos($response, '250') !== 0) {
            fclose($socket);
            return ['sent' => false, 'error' => "EHLO after STARTTLS failed: {$response}"];
        }
    }

    $response = smtpSendCommand($socket, 'AUTH LOGIN');
    if (strpos($response, '334') !== 0) {
        fclose($socket);
        return ['sent' => false, 'error' => "AUTH LOGIN failed: {$response}"];
    }

    $response = smtpSendCommand($socket, base64_encode($smtpUser));
    if (strpos($response, '334') !== 0) {
        fclose($socket);
        return ['sent' => false, 'error' => "SMTP username rejected: {$response}"];
    }

    $response = smtpSendCommand($socket, base64_encode($smtpPass));
    if (strpos($response, '235') !== 0) {
        fclose($socket);
        return ['sent' => false, 'error' => "SMTP password rejected: {$response}"];
    }

    $response = smtpSendCommand($socket, "MAIL FROM:<{$fromEmail}>");
    if (strpos($response, '250') !== 0) {
        fclose($socket);
        return ['sent' => false, 'error' => "MAIL FROM failed: {$response}"];
    }

    $response = smtpSendCommand($socket, "RCPT TO:<{$toEmail}>");
    if (strpos($response, '250') !== 0 && strpos($response, '251') !== 0) {
        fclose($socket);
        return ['sent' => false, 'error' => "RCPT TO failed: {$response}"];
    }

    $response = smtpSendCommand($socket, 'DATA');
    if (strpos($response, '354') !== 0) {
        fclose($socket);
        return ['sent' => false, 'error' => "DATA command failed: {$response}"];
    }

    $messageLines = [];
    $messageLines[] = "From: {$fromName} <{$fromEmail}>";
    $messageLines[] = "To: {$toEmail}";
    $messageLines[] = "Subject: {$subject}";
    foreach ($headers as $header) {
        if (stripos($header, 'from:') === 0 || stripos($header, 'reply-to:') === 0) {
            continue;
        }
        $messageLines[] = $header;
    }
    $messageLines[] = '';
    $messageLines[] = $body;
    $messageData = implode("\r\n", $messageLines);
    $messageData = preg_replace('/^\./m', '..', $messageData);
    $messageData .= "\r\n.\r\n";

    $response = smtpSendRaw($socket, $messageData);
    if (strpos($response, '250') !== 0) {
        fclose($socket);
        return ['sent' => false, 'error' => "Sending DATA failed: {$response}"];
    }

    smtpSendCommand($socket, 'QUIT');
    fclose($socket);

    return ['sent' => true];
}

function smtpReadResponse($socket): string
{
    $response = '';

    while (($line = fgets($socket, 515)) !== false) {
        $response .= trim($line) . '\n';
        if (isset($line[3]) && $line[3] === ' ') {
            break;
        }
    }

    return trim($response);
}

function smtpSendCommand($socket, string $command): string
{
    fwrite($socket, $command . "\r\n");
    return smtpReadResponse($socket);
}

function smtpSendRaw($socket, string $data): string
{
    fwrite($socket, $data);
    return smtpReadResponse($socket);
}
