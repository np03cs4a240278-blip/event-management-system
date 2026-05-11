<?php

// Route dispatcher — maps HTTP method + path to the correct controller action
function handleApiRequest($method, $path, $auth, $users, $event, $booking, $contact)
{
    $parts = explode('/', trim($path, '/'));

    // Must start with /api
    if ($parts[0] !== 'api') {
        jsonResponse(['message' => 'Route not found'], 404);
    }

    // Remove 'api' prefix
    array_shift($parts);

    $resource = $parts[0] ?? '';
    $id       = $parts[1] ?? null;

    // ── AUTH ROUTES ──────────────────────────────────────────────────────────
    if ($resource === 'register'        && $method === 'POST') { $auth->register();        }
    if ($resource === 'login'           && $method === 'POST') { $auth->login();           }
    if ($resource === 'forgot-password' && $method === 'POST') { $auth->forgotPassword();  }
    if ($resource === 'change-password' && $method === 'POST') { $auth->changePassword();  }
    if ($resource === 'logout'          && $method === 'GET')  { $auth->logout();          }
    if ($resource === 'me'              && $method === 'GET')  { $auth->me();              }

    // ── USER ROUTES ──────────────────────────────────────────────────────────
    if ($resource === 'users' && $method === 'GET' && !$id) {
        $users->index();
    }

    // ── CONTACT MESSAGES ─────────────────────────────────────────────────────
    if ($resource === 'contact-messages' && $method === 'POST' && !$id) {
        $contact->store();
    }

    // ── EVENT ROUTES ─────────────────────────────────────────────────────────
    if ($resource === 'events' && $method === 'GET'  && !$id) { $event->index();       }
    if ($resource === 'events' && $method === 'POST')          { $event->store();       }

    if ($resource === 'events' && $id) {
        if ($method === 'GET')    $event->show($id);
        if ($method === 'PUT')    $event->update($id);
        if ($method === 'DELETE') $event->destroy($id);
    }

    // ── BOOKING ROUTES ───────────────────────────────────────────────────────
    if ($resource === 'bookings' && $method === 'POST' && !$id) {
        $booking->store();
    }

    // POST /api/bookings/{id}/confirm  — admin confirm/update
    if ($resource === 'bookings' && $id && (($parts[2] ?? null) === 'confirm') && $method === 'POST') {
        $booking->update($id);
    }

    // PUT /api/bookings/{id}  — admin update (alternative)
    if ($resource === 'bookings' && $method === 'PUT' && $id) {
        $booking->update($id);
    }

    // DELETE /api/bookings/{id}  — cancel booking
    if ($resource === 'bookings' && $method === 'DELETE' && $id) {
        $booking->destroy($id);
    }

    if ($resource === 'my-bookings'  && $method === 'GET') { $booking->myBookings();  }
    if ($resource === 'all-bookings' && $method === 'GET') { $booking->allBookings(); }

    // Nothing matched
    jsonResponse(['message' => 'Route not found'], 404);
}
