<?php

namespace App\Http\Requests;

use App\Enums\NotificationChannel;
use App\Enums\RepeatRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReminderRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Autorização feita na Policy
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'scheduled_at' => 'required|date|after:now',
            'repeat_rule' => ['nullable', Rule::enum(RepeatRule::class)],
            'channel' => ['nullable', Rule::enum(NotificationChannel::class)],
            'days_of_week' => 'nullable|array',
            'days_of_week.*' => ['string', Rule::in(['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'])],
            'timezone_override' => 'nullable|timezone',
            'snooze_minutes_default' => 'nullable|integer|min:0|max:1440',
            'active_window_start' => 'nullable|date_format:H:i',
            'active_window_end' => 'nullable|date_format:H:i|after:active_window_start',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.required' => 'O título do lembrete é obrigatório.',
            'title.max' => 'O título não pode ter mais de 255 caracteres.',
            'scheduled_at.required' => 'A data/hora do lembrete é obrigatória.',
            'scheduled_at.date' => 'A data/hora deve ser válida.',
            'scheduled_at.after' => 'A data/hora deve ser no futuro.',
            'days_of_week.array' => 'Os dias da semana devem ser um array.',
            'days_of_week.*.in' => 'Dia da semana inválido. Use: MON, TUE, WED, THU, FRI, SAT, SUN.',
            'timezone_override.timezone' => 'Timezone inválida. Use formato IANA (ex: America/Sao_Paulo).',
            'snooze_minutes_default.integer' => 'Os minutos de snooze devem ser um número inteiro.',
            'snooze_minutes_default.max' => 'Os minutos de snooze não podem exceder 1440 (24 horas).',
            'active_window_start.date_format' => 'O horário de início deve estar no formato H:i (ex: 08:00).',
            'active_window_end.date_format' => 'O horário de fim deve estar no formato H:i (ex: 22:00).',
            'active_window_end.after' => 'O horário de fim deve ser posterior ao horário de início.',
        ];
    }
}

