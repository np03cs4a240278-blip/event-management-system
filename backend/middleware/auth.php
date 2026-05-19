<?php
declare(strict_types=1);

function getAuthenticatedUser(): ?array
{
    return isset($_SESSION['user']) && is_array($_SESSION['user']) ? $_SESSION['user'] : null;
}

function clearAuthSession(): void
{
    $_SESSION = [];

    if (session_status() === PHP_SESSION_ACTIVE) {
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();

            setcookie(
                session_name(),
                '',
                time() - 42000,
                $params['path'] ?? '/',
                $params['domain'] ?? '',
                (bool)($params['secure'] ?? false),
                (bool)($params['httponly'] ?? true)
            );
        }

        session_destroy();
    }
}

function refreshAuthenticatedUser(): ?array
{
    $sessionUser = getAuthenticatedUser();

    if ($sessionUser === null || empty($sessionUser['id'])) {
        return null;
    }

    global $userModel;

    if (!isset($userModel)) {
        return $sessionUser;
    }

    $user = $userModel->findById($sessionUser['id']);

    if (!$user) {
        clearAuthSession();
        return null;
    }

    if (($user['account_status'] ?? 'active') !== 'active') {
        clearAuthSession();
        jsonResponse(['message' => 'This account has been deactivated. Please contact the admin.'], 403);
    }

    $_SESSION['user'] = $userModel->toPublicUser($user);

    return $_SESSION['user'];
}

function requireAuth(): array
{
    $user = refreshAuthenticatedUser();

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
