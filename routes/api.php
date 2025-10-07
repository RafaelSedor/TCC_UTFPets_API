<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PetController;
use App\Http\Controllers\MealController;
use App\Http\Controllers\SharedPetController;
use App\Http\Controllers\ReminderController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\LocationController;

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
    // Rotas de locations
    Route::get('locations', [LocationController::class, 'index']);
    Route::post('locations', [LocationController::class, 'store']);
    Route::get('locations/{location}', [LocationController::class, 'show']);
    Route::put('locations/{location}', [LocationController::class, 'update']);
    Route::delete('locations/{location}', [LocationController::class, 'destroy']);
    
    // Rotas de pets
    Route::get('pets', [PetController::class, 'index']);
    Route::post('pets', [PetController::class, 'store']);
    Route::get('pets/{pet}', [PetController::class, 'show']);
    Route::put('pets/{pet}', [PetController::class, 'update']);
    Route::delete('pets/{pet}', [PetController::class, 'destroy']);
    
    // Rotas de refeições aninhadas com pets
    Route::prefix('pets/{pet}')->group(function () {
        Route::apiResource('meals', MealController::class);
        Route::post('meals/{meal}/consume', [MealController::class, 'consume']);
        
        // Rotas de compartilhamento de pets
        Route::get('share', [SharedPetController::class, 'index']);
        Route::post('share', [SharedPetController::class, 'store']);
        Route::post('share/{user}/accept', [SharedPetController::class, 'accept']);
        Route::patch('share/{user}', [SharedPetController::class, 'update']);
        Route::delete('share/{user}', [SharedPetController::class, 'destroy']);
        
        // Rotas de lembretes aninhadas com pets
        Route::get('reminders', [ReminderController::class, 'index']);
        Route::post('reminders', [ReminderController::class, 'store']);
    });
    
    // Rotas de lembretes (não aninhadas)
    Route::get('reminders/{reminder}', [ReminderController::class, 'show']);
    Route::patch('reminders/{reminder}', [ReminderController::class, 'update']);
    Route::delete('reminders/{reminder}', [ReminderController::class, 'destroy']);
    Route::post('reminders/{reminder}/snooze', [ReminderController::class, 'snooze']);
    Route::post('reminders/{reminder}/complete', [ReminderController::class, 'complete']);
    
    // Rotas de notificações
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::post('notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    
    // Rotas administrativas (requerem admin)
    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('users', [AdminController::class, 'listUsers']);
        Route::patch('users/{id}', [AdminController::class, 'updateUser']);
        Route::get('pets', [AdminController::class, 'listPets']);
        Route::get('audit-logs', [AdminController::class, 'listAuditLogs']);
    });
});
