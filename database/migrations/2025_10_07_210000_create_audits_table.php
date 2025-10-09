<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('audits', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->unsignedBigInteger('user_id')->nullable(); // Null para eventos de sistema
            $table->string('action'); // pet.created, meal.updated, share.invited, etc
            $table->string('entity'); // pet, meal, shared_pet, reminder, etc
            $table->string('entity_id')->nullable();
            $table->json('payload')->nullable(); // Diffs ou dados relevantes
            $table->string('ip')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
            
            $table->index('user_id');
            $table->index('action');
            $table->index('entity');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audits');
    }
};

