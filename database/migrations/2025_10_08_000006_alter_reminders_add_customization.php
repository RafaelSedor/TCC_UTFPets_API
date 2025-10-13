<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reminders', function (Blueprint $table) {
            if (!Schema::hasColumn('reminders', 'days_of_week')) {
                $table->json('days_of_week')->nullable()->after('channel');
            }
            if (!Schema::hasColumn('reminders', 'timezone_override')) {
                $table->string('timezone_override')->nullable()->after('days_of_week');
            }
            if (!Schema::hasColumn('reminders', 'snooze_minutes_default')) {
                $table->integer('snooze_minutes_default')->nullable()->after('timezone_override');
            }
            if (!Schema::hasColumn('reminders', 'active_window_start')) {
                $table->time('active_window_start')->nullable()->after('snooze_minutes_default');
            }
            if (!Schema::hasColumn('reminders', 'active_window_end')) {
                $table->time('active_window_end')->nullable()->after('active_window_start');
            }
        });
    }

    public function down(): void
    {
        Schema::table('reminders', function (Blueprint $table) {
            if (Schema::hasColumn('reminders', 'active_window_end')) {
                $table->dropColumn('active_window_end');
            }
            if (Schema::hasColumn('reminders', 'active_window_start')) {
                $table->dropColumn('active_window_start');
            }
            if (Schema::hasColumn('reminders', 'snooze_minutes_default')) {
                $table->dropColumn('snooze_minutes_default');
            }
            if (Schema::hasColumn('reminders', 'timezone_override')) {
                $table->dropColumn('timezone_override');
            }
            if (Schema::hasColumn('reminders', 'days_of_week')) {
                $table->dropColumn('days_of_week');
            }
        });
    }
};

