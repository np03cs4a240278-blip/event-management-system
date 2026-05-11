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
}
