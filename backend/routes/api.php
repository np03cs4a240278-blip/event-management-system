<?php

function handleApiRequest($method, $path, $auth, $users, $event, $booking, $contact, $recommendation)
{
    $parts = explode('/', trim($path, '/'));

    // Must start with /api
    if ($parts[0] !== 'api') {
        jsonResponse(['message' => 'Route not found'], 404);
    }

    // Remove 'api'
    array_shift($parts);

    $resource = $parts[0] ?? '';
    $id       = $parts[1] ?? null;
    $sub      = $parts[2] ?? null;

    // ── AUTH ROUTES ────────────────────────────────────────────────────────
    if ($resource === 'register' && $method === 'POST') {
        $auth->register();
    }

    if ($resource === 'login' && $method === 'POST') {
        $auth->login();
    }

    if ($resource === 'verify-otp' && $method === 'POST') {
        $auth->verifyOtp();
    }

    if ($resource === 'resend-otp' && $method === 'POST') {
        $auth->resendOtp();
    }

    if ($resource === 'forgot-password' && $method === 'POST') {
        $auth->forgotPassword();
    }

    if ($resource === 'reset-password-otp' && $method === 'POST') {
        $auth->resetPasswordWithOtp();
    }

    if ($resource === 'change-password' && $method === 'POST') {
        $auth->changePassword();
    }

    if ($resource === 'logout' && $method === 'GET') {
        $auth->logout();
    }

    if ($resource === 'me' && $method === 'GET') {
        $auth->me();
    }

    // ── USER ROUTES ────────────────────────────────────────────────────────
    if ($resource === 'users' && $method === 'GET' && !$id) {
        $users->index();
    }

    if ($resource === 'users' && $id && $sub === 'status' && $method === 'PUT') {
        $users->updateStatus($id);
    }

    if ($resource === 'users' && $method === 'DELETE' && $id) {
        $users->destroy($id);
    }

    // ── CONTACT MESSAGE ROUTES ─────────────────────────────────────────────
    // NOTE: specific sub-routes MUST come before generic /:id routes

    // Public: submit a contact form message
    if ($resource === 'contact-messages' && $method === 'POST' && !$id) {
        $contact->store();
    }

    // Admin: get unread count for notification badge
    // GET /api/contact-messages/unread-count
    if ($resource === 'contact-messages' && $id === 'unread-count' && $method === 'GET') {
        $contact->unreadCount();
    }

    // Admin: list all contact messages
    // GET /api/contact-messages
    if ($resource === 'contact-messages' && $method === 'GET' && !$id) {
        $contact->index();
    }

    // Admin: update status of a specific message
    // PUT /api/contact-messages/:id/status
    if ($resource === 'contact-messages' && $id && $sub === 'status' && $method === 'PUT') {
        $contact->updateStatus((int)$id);
    }

    // Admin: delete a specific message
    // DELETE /api/contact-messages/:id
    if ($resource === 'contact-messages' && $method === 'DELETE' && $id && $id !== 'unread-count') {
        $contact->destroy((int)$id);
    }

    // ── EVENT ROUTES ───────────────────────────────────────────────────────
    if ($resource === 'events' && $method === 'GET' && !$id) {
        $event->index();
    }

    if ($resource === 'events' && $method === 'POST') {
        $event->store();
    }

    if ($resource === 'events' && $id) {
        if ($method === 'GET')    $event->show($id);
        if ($method === 'PUT')    $event->update($id);
        if ($method === 'DELETE') $event->destroy($id);
    }

    // ── BOOKING ROUTES ─────────────────────────────────────────────────────
    if ($resource === 'bookings' && $method === 'POST' && !$id) {
        $booking->store();
    }

    if ($resource === 'bookings' && $id && $sub === 'confirm' && $method === 'POST') {
        $booking->update($id);
    }

    if ($resource === 'bookings' && $method === 'DELETE' && $id) {
        $booking->destroy($id);
    }

    if ($resource === 'bookings' && $method === 'PUT' && $id) {
        $booking->update($id);
    }

    if ($resource === 'my-bookings' && $method === 'GET') {
        $booking->myBookings();
    }

    if ($resource === 'all-bookings' && $method === 'GET') {
        $booking->allBookings();
    }

    // ── RECOMMENDATIONS ────────────────────────────────────────────────────
    if ($resource === 'recommendations' && $method === 'GET') {
        $recommendation->index();
    }

    // If nothing matched
    jsonResponse(['message' => 'Route not found'], 404);
}
