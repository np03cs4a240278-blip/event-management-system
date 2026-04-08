<?php
declare(strict_types=1);

function getAuthenticatedUser(): ?array
{
    return isset($_SESSION['user']) && is_array($_SESSION['user']) ? $_SESSION['user'] : null;
}

function requireAuth(): array
{
    $user = getAuthenticatedUser();

    if ($user === null) {
        jsonResponse(['message' => 'Authentication required.'], 401);
    }

    return $user;
}

function requireAdmin(): array
{
    $user = requireAuth();

    if (($user['role'] ?? 'user') !== 'admin') {
        jsonResponse(['message' => 'Admin access required.'], 403);
    }

    return $user;
}
