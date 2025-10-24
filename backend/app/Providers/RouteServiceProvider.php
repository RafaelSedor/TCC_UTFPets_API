<?php

namespace App\Providers;

use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;

class RouteServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->routes(function () {
            Route::middleware(['api', \Illuminate\Http\Middleware\HandleCors::class])
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });

        app('router')->aliasMiddleware('auth', \Illuminate\Auth\Middleware\Authenticate::class);
        Authenticate::redirectUsing(function () {
            return response()->json(['message' => 'Unauthorized'], 401);
        });
    }
}
