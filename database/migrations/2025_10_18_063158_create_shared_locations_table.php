<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
|--------------------------------------------------------------------------
| Módulo 1 - Compartilhamento de Locations (Locais)
| Esta migração cria a tabela shared_locations para permitir compartilhamento
| de locations inteiras, facilitando o acesso a múltiplos pets de uma vez.
|--------------------------------------------------------------------------
*/

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('shared_locations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('location_id')->constrained('locations')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('role', ['owner', 'editor', 'viewer']);
            $table->enum('invitation_status', ['pending', 'accepted', 'revoked'])->default('pending');
            $table->foreignId('invited_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            // Índices para performance
            $table->index('user_id');
            $table->index('role');
            $table->index('invitation_status');

            // Constraint único: um usuário não pode ter múltiplos papéis na mesma location
            $table->unique(['location_id', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shared_locations');
    }
};
