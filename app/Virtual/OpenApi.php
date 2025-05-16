<?php

namespace App\Virtual;

/**
 * @OA\Info(
 *     version="1.0.0",
 *     title="UTFPets API Documentation",
 *     description="API para gerenciamento de pets e suas refeições",
 *     @OA\Contact(
 *         email="utfpets@example.com"
 *     )
 * )
 * 
 * @OA\Server(
 *     description="Local",
 *     url="http://localhost:8080"
 * )
 * 
 * @OA\SecurityScheme(
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     securityScheme="bearerAuth"
 * )
 */
class OpenApi
{
} 