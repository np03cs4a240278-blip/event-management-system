<?php

// Send JSON response
function jsonResponse($data, $status = 200)
{
    http_response_code($status);
    header("Content-Type: application/json");

    echo json_encode($data);
    exit;
}

// Get JSON request data
function getJsonInput()
{
    $input = file_get_contents("php://input");
    return json_decode($input, true) ?? [];
}