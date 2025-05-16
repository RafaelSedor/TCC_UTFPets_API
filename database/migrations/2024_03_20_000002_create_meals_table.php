<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/*
|--------------------------------------------------------------------------
| Módulo 09 - Migrações e Relacionamentos
| Esta migração cria a tabela de refeições com todos os campos necessários e
| suas restrições de integridade referencial.
*/

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('pet_id')->constrained()->onDelete('cascade');
            $table->string('food_type');
            $table->decimal('quantity', 8, 2);
            $table->string('unit');
            $table->timestamp('scheduled_for');
            $table->timestamp('consumed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meals');
    }
}; 