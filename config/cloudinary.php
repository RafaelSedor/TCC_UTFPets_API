<?php

return [
    'cloud_name' => env('CLOUDINARY_CLOUD_NAME', 'test_cloud'),
    'api_key' => env('CLOUDINARY_API_KEY', 'test_key'),
    'api_secret' => env('CLOUDINARY_API_SECRET', 'test_secret'),
    'cloud_url' => env('CLOUDINARY_URL', 'cloudinary://test_key:test_secret@test_cloud'),
    'secure' => true
]; 