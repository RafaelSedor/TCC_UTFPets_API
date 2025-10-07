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
        ];
    }
}

