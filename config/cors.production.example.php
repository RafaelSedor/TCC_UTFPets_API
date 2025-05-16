<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'api/documentation', 'docs', 'oauth2-callback'],
    
    'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    
    'allowed_origins' => [
        'https://seu-frontend.com',
        'https://app.seu-frontend.com'
    ],
    
    'allowed_origins_patterns' => [],
    
    'allowed_headers' => [
        'Accept',
        'Authorization',
        'Content-Type',
        'X-Requested-With',
        'X-XSRF-TOKEN'
    ],
    
    'exposed_headers' => [],
    
    'max_age' => 0,
    
    'supports_credentials' => true,
]; 