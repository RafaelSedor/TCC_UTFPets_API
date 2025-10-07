<?php

namespace App\Http\Requests;

use App\Enums\NotificationChannel;
use App\Enums\RepeatRule;
use App\Enums\ReminderStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateReminderRequest extends FormRequest
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
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'scheduled_at' => 'sometimes|date',
            'repeat_rule' => ['sometimes', Rule::enum(RepeatRule::class)],
            'status' => ['sometimes', Rule::enum(ReminderStatus::class)],
            'channel' => ['sometimes', Rule::enum(NotificationChannel::class)],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'title.max' => 'O título não pode ter mais de 255 caracteres.',
            'scheduled_at.date' => 'A data/hora deve ser válida.',
        ];
    }
}

