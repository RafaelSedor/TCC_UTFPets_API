<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

/*
|--------------------------------------------------------------------------
| Módulo 07 - Forms e Validação de Requisições
| Este Form Request valida os dados de entrada para criação/atualização de pets,
| garantindo a integridade dos dados antes de chegarem ao controller.
*/

class PetStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'species' => 'required|string|max:255',
            'breed' => 'required|string|max:255',
            'birth_date' => 'required|date',
            'weight' => 'required|numeric|min:0',
            'photo' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'notes' => 'nullable|string'
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'O nome do pet é obrigatório',
            'species.required' => 'A espécie do pet é obrigatória',
            'weight.min' => 'O peso não pode ser negativo',
            'photo.required' => 'A foto é obrigatória.',
            'photo.image' => 'O arquivo deve ser uma imagem.',
            'photo.mimes' => 'A imagem deve ser do tipo: jpeg, png, jpg ou gif.',
            'photo.max' => 'A imagem não pode ser maior que 2MB.'
        ];
    }
} 