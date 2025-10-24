<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\Reminder;
use App\Enums\ReminderStatus;
use App\Jobs\SendReminderJob;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Scheduler para processar lembretes
Schedule::call(function () {
    // Busca lembretes ativos que devem ser enviados (dentro dos próximos 5 minutos)
    $reminders = Reminder::active()
        ->pending(5)
        ->get();

    foreach ($reminders as $reminder) {
        // Enfileira o job para processar o lembrete
        SendReminderJob::dispatch($reminder);
    }
})->everyMinute()->name('process-reminders')->withoutOverlapping();
