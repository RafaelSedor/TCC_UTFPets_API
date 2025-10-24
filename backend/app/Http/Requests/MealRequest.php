<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/*
|--------------------------------------------------------------------------
| Módulo 07 - Forms e Validação de Requisições
| Este Form Request valida os dados de entrada para criação/atualização de refeições,
| garantindo a consistência dos dados e regras de negócio.
*/

class MealRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'food_type' => 'sometimes|required|string|max:255',
            'quantity' => 'sometimes|required|numeric|min:0',
            'unit' => 'sometimes|required|string|in:g,ml',
            'scheduled_for' => 'sometimes|required|date',
            'consumed_at' => 'nullable|date',
            'notes' => 'nullable|string'
        ];
    }

    public function messages(): array
    {
        return [
            'food_type.required' => 'O tipo de alimento é obrigatório',
            'quantity.required' => 'A quantidade é obrigatória',
            'quantity.min' => 'A quantidade não pode ser negativa',
            'unit.required' => 'A unidade de medida é obrigatória',
            'unit.in' => 'A unidade de medida deve ser g ou ml',
            'scheduled_for.required' => 'A data/hora agendada é obrigatória',
            'scheduled_for.date' => 'A data/hora agendada deve ser válida'
        ];
    }
} 