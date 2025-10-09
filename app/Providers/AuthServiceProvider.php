<?php

namespace App\Providers;

use App\Models\Pet;
use App\Models\EducationalArticle;
use App\Policies\PetPolicy;
use App\Policies\EducationalArticlePolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Pet::class => PetPolicy::class,
        EducationalArticle::class => EducationalArticlePolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}
