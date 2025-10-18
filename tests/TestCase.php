<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\Auth;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Configurar Cloudinary com valores de teste para evitar erros de inicialização
        config([
            'cloudinary.cloud_url' => 'cloudinary://test_key:test_secret@test_cloud',
            'cloudinary.cloud_name' => 'test_cloud',
            'cloudinary.api_key' => 'test_key',
            'cloudinary.api_secret' => 'test_secret',
        ]);
    }

    protected function getToken($user)
    {
        return Auth::login($user);
    }
}
