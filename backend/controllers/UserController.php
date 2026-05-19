<?php

class UserController
{
    private $users;

    public function __construct($users)
    {
        $this->users = $users;
    }

    public function index()
    {
        requireAdmin();

        $users = $this->users->allPublicUsers();

        jsonResponse([
            'users' => $users
        ]);
    }

    public function updateStatus($id)
    {
        $adminUser = requireAdmin();
        $targetUser = $this->findUserOrFail($id);
        $data = getJsonInput();
        $status = strtolower(trim($data['status'] ?? ''));

        if (!in_array($status, ['active', 'deactivated'], true)) {
            jsonResponse(['message' => 'Please choose a valid account status.'], 422);
        }

        $this->ensureRegularUserCanBeManaged($adminUser, $targetUser, 'have their status changed');

        $this->users->updateAccountStatus($targetUser['id'], $status);
        $updatedUser = $this->findUserOrFail($targetUser['id']);

        jsonResponse([
            'message' => $status === 'deactivated'
                ? 'User account deactivated successfully.'
                : 'User account reactivated successfully.',
            'user' => $this->users->toPublicUser($updatedUser)
        ]);
    }

    public function destroy($id)
    {
        $adminUser = requireAdmin();
        $targetUser = $this->findUserOrFail($id);

        $this->ensureRegularUserCanBeManaged($adminUser, $targetUser, 'be deleted');

        $this->users->deleteById($targetUser['id']);

        jsonResponse([
            'message' => 'User account deleted successfully.'
        ]);
    }

    private function findUserOrFail($id)
    {
        $userId = (int)$id;

        if ($userId <= 0) {
            jsonResponse(['message' => 'Invalid user selected.'], 422);
        }

        $user = $this->users->findById($userId);

        if (!$user) {
            jsonResponse(['message' => 'User not found.'], 404);
        }

        return $user;
    }

    private function ensureRegularUserCanBeManaged($adminUser, $targetUser, $action)
    {
        if ((int)$targetUser['id'] === (int)$adminUser['id']) {
            jsonResponse(['message' => 'You cannot manage your own admin account here.'], 403);
        }

        if (($targetUser['role'] ?? 'user') !== 'user') {
            jsonResponse(['message' => "Only regular user accounts can be {$action}."], 403);
        }
    }
}
