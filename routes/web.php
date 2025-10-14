<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CalendarController;

// Página inicial: landing com resumo do projeto e instruções rápidas
Route::get('/', function () {
    return view('landing', [
        'appName'   => config('app.name', 'UTFPets API'),
        'baseUrl'   => rtrim(config('app.url', url('/')), '/'),
        'docsUrl'   => url('/swagger'),
        'healthUrl' => url('/api/health'),
    ]);
});

// Rota pública para feed ICS (Módulo 13)
Route::get('calendar/{calendarToken}.ics', [CalendarController::class, 'feed'])->name('calendar.feed');

// Rota para download de Postman Collection (Módulo 17)
Route::get('/dev/postman', function () {
    $path = storage_path('app/public/postman/UTFPets.postman_collection.json');
    
    if (!file_exists($path)) {
        return response()->json([
            'message' => 'Postman collection não encontrada.',
            'hint' => 'Execute: php artisan postman:generate'
        ], 404);
    }
    
    return response()->download($path, 'UTFPets.postman_collection.json', [
        'Content-Type' => 'application/json',
    ]);
})->name('dev.postman');

// Expor OpenAPI com CORS tratado pelo HandleCors (evita CORS em arquivo estático)
Route::get('/openapi.json', function () {
    $path = public_path('api-docs.json');
    if (!file_exists($path)) {
        return response()->json([
            'message' => 'OpenAPI spec não encontrada.'
        ], 404);
    }
    return response()->file($path, [
        'Content-Type' => 'application/json',
    ]);
})->name('openapi.json');
