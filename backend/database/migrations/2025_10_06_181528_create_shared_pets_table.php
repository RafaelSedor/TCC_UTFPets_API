<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
|--------------------------------------------------------------------------
| Módulo 1 - Compartilhamento de Pets com Papéis
| Esta migração cria a tabela shared_pets para permitir colaboração
| entre usuários com diferentes papéis (owner, editor, viewer).
|--------------------------------------------------------------------------
*/

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shared_pets', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignId('pet_id')->constrained('pets')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('role', ['owner', 'editor', 'viewer']);
            $table->enum('invitation_status', ['pending', 'accepted', 'revoked'])->default('pending');
            $table->foreignId('invited_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            // Índices para performance
            $table->index('user_id');
            $table->index('role');
            $table->index('invitation_status');
            
            // Constraint único: um usuário não pode ter múltiplos papéis no mesmo pet
            $table->unique(['pet_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shared_pets');
    }
};

