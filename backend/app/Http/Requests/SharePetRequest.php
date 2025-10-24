<?php

namespace App\Http\Requests;

use App\Enums\SharedPetRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SharePetRequest extends FormRequest
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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'user_id' => ['required_without:email', 'integer', 'exists:users,id'],
            'email' => ['required_without:user_id', 'email', 'exists:users,email'],
            'role' => ['required', Rule::enum(SharedPetRole::class), 'not_in:owner'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'user_id.required_without' => 'É necessário informar user_id ou email.',
            'email.required_without' => 'É necessário informar user_id ou email.',
            'user_id.exists' => 'Usuário não encontrado.',
            'email.exists' => 'Usuário com este email não encontrado.',
            'role.required' => 'O papel (role) é obrigatório.',
            'role.not_in' => 'Não é permitido criar convites com papel de owner.',
        ];
    }

    /**
     * Resolve o user_id a partir do email se necessário
     */
    public function getUserId(): int
    {
        if ($this->has('user_id')) {
            return $this->input('user_id');
        }

        $user = \App\Models\User::where('email', $this->input('email'))->first();
        return $user->id;
    }

    /**
     * Get the validated data with resolved user
     */
    public function validated($key = null, $default = null)
    {
        $validated = parent::validated($key, $default);
        
        // Adiciona a chave 'user' com o objeto User resolvido
        if (isset($validated['user_id'])) {
            $validated['user'] = \App\Models\User::find($validated['user_id']);
        } elseif (isset($validated['email'])) {
            $validated['user'] = \App\Models\User::where('email', $validated['email'])->first();
        }
        
        return $validated;
    }
}

