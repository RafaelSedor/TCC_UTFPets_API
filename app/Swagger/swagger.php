<?php

/**
 * @OA\Info(
 *     version="1.0.0",
 *     title="UTFPets API Documentation",
 *     description="API para gerenciamento de pets e suas refeições",
 *     @OA\Contact(
 *         email="contato@utfpets.com"
 *     )
 * )
 */

/**
 * @OA\SecurityScheme(
 *     type="http",
 *     scheme="bearer",
 *     bearerFormat="JWT",
 *     securityScheme="bearerAuth"
 * )
 */

/**
 * @OA\Tag(
 *     name="Auth",
 *     description="Endpoints de autenticação"
 * )
 * 
 * @OA\Tag(
 *     name="Pets",
 *     description="Endpoints de gerenciamento de pets"
 * )
 * 
 * @OA\Tag(
 *     name="Meals",
 *     description="Endpoints de gerenciamento de refeições"
 * )
 */ 