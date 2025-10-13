<?php

return [
    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
        'calendar/*',
        'api-docs.json',
    ],

    'allowed_methods' => ['*'],

    // Defina em produção a origem do seu frontend, ex: https://app.seudominio.com
    // Múltiplas origens separadas por vírgula.
    'allowed_origins' => explode(',', env('CORS_ALLOWED_ORIGINS', '*')),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],

    'exposed_headers' => [],

    'max_age' => 86400,

    // Não use credenciais com wildcard de origem. Ajuste via env quando necessário.
    'supports_credentials' => filter_var(env('CORS_ALLOW_CREDENTIALS', false), FILTER_VALIDATE_BOOL),
];

