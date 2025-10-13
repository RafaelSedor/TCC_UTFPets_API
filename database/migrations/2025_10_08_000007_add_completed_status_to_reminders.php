<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // No-op for Postgres: status já contempla valores necessários via enum textual
        // Mantido para compatibilidade de sequência de migrações
    }

    public function down(): void
    {
        // No-op
    }
};

