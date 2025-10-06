<?php

namespace App\Http\Controllers;

use App\Models\Pet;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use App\Http\Requests\PetStoreRequest;
use App\Http\Requests\PetUpdateRequest;
use Illuminate\Support\Facades\Log;

class PetController extends Controller
{
    /**
     * Lista todos os pets do usuário autenticado
     */
    public function index(): JsonResponse
    {
        $pets = Pet::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($pets);
    }

    /**
     * Cria um novo pet
     */
    public function store(PetStoreRequest $request): JsonResponse
    {
        try {
            $validated = $request->validated();
            
            // Upload da foto para o Cloudinary
            if ($request->hasFile('photo')) {
                $uploadedFileUrl = Cloudinary::upload($request->file('photo')->getRealPath())->getSecurePath();
                $validated['photo_url'] = $uploadedFileUrl;
            }

            $pet = Pet::create(array_merge($validated, [
                'user_id' => Auth::id()
            ]));

            Log::info('Pet criado com sucesso', ['pet_id' => $pet->id, 'user_id' => Auth::id()]);

            return response()->json([
                'message' => 'Pet cadastrado com sucesso',
                'pet' => $pet
            ], 201);

        } catch (\Exception $e) {
            Log::error('Erro ao criar pet', [
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Erro interno do servidor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Exibe um pet específico
     */
    public function show(Pet $pet): JsonResponse
    {
        $this->authorize('view', $pet);

        return response()->json($pet);
    }

    /**
     * Atualiza um pet
     */
    public function update(PetUpdateRequest $request, Pet $pet): JsonResponse
    {
        $this->authorize('update', $pet);

        try {
            $validated = $request->validated();
            
            // Upload da nova foto se fornecida
            if ($request->hasFile('photo')) {
                // Remove a foto antiga do Cloudinary se existir
                if ($pet->photo_url) {
                    try {
                        $publicId = basename(parse_url($pet->photo_url, PHP_URL_PATH), '.jpg');
                        Cloudinary::destroy($publicId);
                    } catch (\Exception $e) {
                        Log::warning('Erro ao remover foto antiga do Cloudinary', [
                            'pet_id' => $pet->id,
                            'photo_url' => $pet->photo_url,
                            'error' => $e->getMessage()
                        ]);
                    }
                }

                $uploadedFileUrl = Cloudinary::upload($request->file('photo')->getRealPath())->getSecurePath();
                $validated['photo_url'] = $uploadedFileUrl;
            }

            $pet->update($validated);

            Log::info('Pet atualizado com sucesso', ['pet_id' => $pet->id, 'user_id' => Auth::id()]);

            return response()->json([
                'message' => 'Pet atualizado com sucesso',
                'pet' => $pet
            ]);

        } catch (\Exception $e) {
            Log::error('Erro ao atualizar pet', [
                'pet_id' => $pet->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Erro interno do servidor',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove um pet
     */
    public function destroy(Pet $pet): JsonResponse
    {
        $this->authorize('delete', $pet);

        try {
            // Remove a foto do Cloudinary se existir
            if ($pet->photo_url) {
                try {
                    $publicId = basename(parse_url($pet->photo_url, PHP_URL_PATH), '.jpg');
                    Cloudinary::destroy($publicId);
                } catch (\Exception $e) {
                    Log::warning('Erro ao remover foto do Cloudinary', [
                        'pet_id' => $pet->id,
                        'photo_url' => $pet->photo_url,
                        'error' => $e->getMessage()
                    ]);
                }
            }

            $pet->delete();

            Log::info('Pet removido com sucesso', ['pet_id' => $pet->id, 'user_id' => Auth::id()]);

            return response()->json(null, 204);

        } catch (\Exception $e) {
            Log::error('Erro ao remover pet', [
                'pet_id' => $pet->id,
                'user_id' => Auth::id(),
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'Erro interno do servidor',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}