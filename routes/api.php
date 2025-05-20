<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PetController;
use App\Http\Controllers\MealController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Módulo 04 - Roteamento e Ciclo de Vida de uma Request
| Aqui definimos todas as rotas da API, agrupadas por middleware e prefixos
| para melhor organização e segurança.
*/

// Rotas públicas de autenticação
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::middleware('jwt.auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

// Rotas protegidas que requerem autenticação
Route::prefix('v1')->middleware('jwt.auth')->group(function () {
    // Rotas de pets
    Route::get('pets', [PetController::class, 'index']);
    Route::post('pets', [PetController::class, 'store']);
    Route::get('pets/{pet}', [PetController::class, 'show']);
    Route::post('pets/{pet}', [PetController::class, 'update']);
    Route::delete('pets/{pet}', [PetController::class, 'destroy']);
    
    // Rotas de refeições aninhadas com pets
    Route::prefix('pets/{pet}')->group(function () {
        Route::apiResource('meals', MealController::class);
        Route::post('meals/{meal}/consume', [MealController::class, 'consume']);
    });
});
