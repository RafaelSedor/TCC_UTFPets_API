<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PetController;
use App\Http\Controllers\MealController;
use App\Http\Controllers\SharedPetController;
use App\Http\Controllers\SharedLocationController;
use App\Http\Controllers\ReminderController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\PushSubscriptionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
| Módulo 04 - Roteamento e Ciclo de Vida de uma Request
| Aqui definimos todas as rotas da API, agrupadas por middleware e prefixos
| para melhor organização e segurança.
*/

// Health Check - Para monitoramento (Render, Docker, etc)
Route::get('/health', function () {
    try {
        $dbStatus = \DB::connection()->getPdo() ? 'connected' : 'disconnected';
    } catch (\Exception $e) {
        $dbStatus = 'error: ' . $e->getMessage();
    }
    
    return response()->json([
        'status' => 'ok',
        'app' => config('app.name'),
        'version' => '1.0.0',
        'environment' => config('app.env'),
        'timestamp' => now()->toIso8601String(),
        'database' => $dbStatus,
    ]);
});

// ========================================
// NÃO É MUST HAVE - Artigos educacionais
// ========================================
// Rotas públicas de artigos educacionais (sem autenticação)
// Route::prefix('educational-articles')->group(function () {
//     Route::get('/', [EducationalArticleController::class, 'index']);
//     Route::get('/{slug}', [EducationalArticleController::class, 'show']);
// });

// Rotas da API v1
Route::prefix('v1')->group(function () {
    // Rotas públicas de autenticação (sem middleware)
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
    });
});;

// Rotas protegidas que requerem autenticação
Route::prefix('v1')->middleware('jwt.auth')->group(function () {
    // Rotas de autenticação protegidas
    Route::prefix('auth')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
    // Rotas de locations
    Route::get('locations', [LocationController::class, 'index']);
    Route::post('locations', [LocationController::class, 'store']);
    Route::get('locations/{location}', [LocationController::class, 'show']);
    Route::put('locations/{location}', [LocationController::class, 'update']);
    Route::delete('locations/{location}', [LocationController::class, 'destroy']);

    // Rotas de compartilhamento de locations
    Route::prefix('locations/{location}')->group(function () {
        Route::get('share', [SharedLocationController::class, 'index']);
        Route::post('share', [SharedLocationController::class, 'store']);
        Route::post('share/{user}/accept', [SharedLocationController::class, 'accept']);
        Route::patch('share/{user}', [SharedLocationController::class, 'update']);
        Route::delete('share/{user}', [SharedLocationController::class, 'destroy']);
    });
    
    // Rotas de pets
    Route::get('pets', [PetController::class, 'index']);
    Route::post('pets', [PetController::class, 'store']);
    Route::get('pets/{pet}', [PetController::class, 'show']);
    Route::put('pets/{pet}', [PetController::class, 'update']);
    Route::post('pets/{pet}', [PetController::class, 'update']);
    Route::delete('pets/{pet}', [PetController::class, 'destroy']);

    // Rota global para listar todas as refeições do usuário
    Route::get('meals', [MealController::class, 'indexAll']);

    // Rotas globais de compartilhamento de pets
    Route::get('shared-pets/by-me', [SharedPetController::class, 'sharedByMe']);
    Route::get('shared-pets/with-me', [SharedPetController::class, 'sharedWithMe']);

    // Rotas globais de compartilhamento de locations
    Route::get('shared-locations/by-me', [SharedLocationController::class, 'sharedByMe']);
    Route::get('shared-locations/with-me', [SharedLocationController::class, 'sharedWithMe']);

    // Rota global para listar todos os lembretes do usuário
    Route::get('reminders', [ReminderController::class, 'indexAll']);

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
        
        // ========================================
        // NÃO É MUST HAVE - Controle de peso
        // ========================================
        // Rotas de pesos aninhadas com pets (Módulo 12)
        // Route::apiResource('weights', PetWeightController::class)->parameters(['weights' => 'petWeight']);

        // ========================================
        // NÃO É MUST HAVE - Resumo nutricional
        // ========================================
        // Rotas de resumo nutricional (Módulo 16)
        // Route::get('nutrition/summary', [NutritionSummaryController::class, 'summary']);
    });
    
    // Rotas de lembretes (não aninhadas)
    Route::get('reminders/{reminder}', [ReminderController::class, 'show']);
    Route::patch('reminders/{reminder}', [ReminderController::class, 'update']);
    Route::delete('reminders/{reminder}', [ReminderController::class, 'destroy']);
    Route::post('reminders/{reminder}/snooze', [ReminderController::class, 'snooze']);
    Route::post('reminders/{reminder}/complete', [ReminderController::class, 'complete']);
    // ========================================
    // NÃO É MUST HAVE - Teste de lembrete
    // ========================================
    // Route::post('reminders/{reminder}/test', [ReminderController::class, 'test']);
    
    // Rotas de notificações
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::patch('notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
    Route::post('notifications/mark-all-read', [NotificationController::class, 'markAllAsRead']);

    // Rotas de push subscriptions
    Route::get('push-subscriptions', [PushSubscriptionController::class, 'index']);
    Route::post('push-subscriptions', [PushSubscriptionController::class, 'store']);
    Route::delete('push-subscriptions', [PushSubscriptionController::class, 'destroy']);
    
    // ========================================
    // NÃO É MUST HAVE - Calendário
    // ========================================
    // Rotas de calendário (Módulo 13)
    // Route::get('calendar', [CalendarController::class, 'show']);
    // Route::post('calendar/rotate-token', [CalendarController::class, 'rotateToken']);

    // ========================================
    // NÃO É MUST HAVE - Dispositivos/FCM
    // ========================================
    // Rotas de dispositivos/FCM (Módulo 8)
    // Route::get('devices', [UserDeviceController::class, 'index']);
    // Route::post('devices/register', [UserDeviceController::class, 'register']);
    // Route::delete('devices/{device}', [UserDeviceController::class, 'destroy']);

    // ========================================
    // NÃO É MUST HAVE - GraphQL Proxy
    // ========================================
    // Rotas de GraphQL Proxy (Módulo 11)
    // Route::post('graphql/read', [GraphQLProxyController::class, 'read']);
    
    // Rotas administrativas (requerem admin)
    Route::prefix('admin')->middleware('admin')->group(function () {
        Route::get('users', [AdminController::class, 'listUsers']);
        Route::patch('users/{id}', [AdminController::class, 'updateUser']);
        Route::get('pets', [AdminController::class, 'listPets']);
        Route::get('audit-logs', [AdminController::class, 'listAuditLogs']);
        
        // ========================================
        // NÃO É MUST HAVE - Estatísticas gerais
        // ========================================
        // Estatísticas gerais (Módulo 18)
        // Route::get('stats/overview', [AdminController::class, 'overview']);

        // ========================================
        // NÃO É MUST HAVE - Artigos educacionais (admin)
        // ========================================
        // Rotas de artigos educacionais (admin) - Módulo 14
        // Route::post('educational-articles', [EducationalArticleController::class, 'store']);
        // Route::patch('educational-articles/{id}', [EducationalArticleController::class, 'update']);
        // Route::delete('educational-articles/{id}', [EducationalArticleController::class, 'destroy']);
        // Route::post('educational-articles/{id}/publish', [EducationalArticleController::class, 'publish']);

        // Content tools (Módulo 18)
        // Route::get('educational-articles/drafts', [EducationalArticleController::class, 'drafts']);
        // Route::post('educational-articles/{id}/duplicate', [EducationalArticleController::class, 'duplicate']);
    });
});
