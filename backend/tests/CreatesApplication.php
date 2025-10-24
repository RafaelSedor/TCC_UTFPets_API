<?php

namespace Tests;

use Illuminate\Contracts\Console\Kernel;

trait CreatesApplication
{
    /**
     * Creates the application.
     */
    public function createApplication()
    {
        // Define variáveis de ambiente para Cloudinary antes da aplicação inicializar
        // Isso garante que o CloudinaryServiceProvider não falhe durante os testes
        putenv('CLOUDINARY_URL=cloudinary://test_key:test_secret@test_cloud');
        putenv('CLOUDINARY_CLOUD_NAME=test_cloud');
        putenv('CLOUDINARY_API_KEY=test_key');
        putenv('CLOUDINARY_API_SECRET=test_secret');

        $app = require __DIR__.'/../bootstrap/app.php';

        $app->make(Kernel::class)->bootstrap();

        return $app;
    }
} 