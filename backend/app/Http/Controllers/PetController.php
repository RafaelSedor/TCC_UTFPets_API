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
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();

        // Pets que o usuário possui (é owner)
        $ownPetsQuery = Pet::select('id')->where('user_id', $user->id);

        // Pets compartilhados com o usuário (é editor ou viewer)
        $sharedPetsQuery = Pet::select('id')->whereHas('sharedWith', function($q) use ($user) {
            $q->where('user_id', $user->id)
              ->where('invitation_status', 'accepted');
        });

        // Filtro por location_id (aplicar ANTES do union)
        if ($request->has('location_id')) {
            $ownPetsQuery->where('location_id', $request->location_id);
            $sharedPetsQuery->where('location_id', $request->location_id);
        }

        // Buscar pets com relacionamentos
        $petIds = $ownPetsQuery->union($sharedPetsQuery)->pluck('id');

        if ($petIds->isEmpty()) {
            return response()->json([]);
        }

        $pets = Pet::whereIn('id', $petIds)
            ->with(['location:id,name,timezone', 'user:id,name,email'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function($pet) use ($user) {
                // Adicionar informação do papel do usuário
                $pet->user_role = $pet->getUserRole($user);
                return $pet;
            });

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
                try {
                    $uploadedFileUrl = Cloudinary::upload($request->file('photo')->getRealPath())->getSecurePath();
                    $validated['photo'] = $uploadedFileUrl;
                } catch (\Exception $cloudinaryError) {
                    Log::error('Erro no upload do Cloudinary', [
                        'user_id' => Auth::id(),
                        'error' => $cloudinaryError->getMessage(),
                        'trace' => $cloudinaryError->getTraceAsString()
                    ]);
                    
                    return response()->json([
                        'message' => 'Erro no upload da imagem',
                        'error' => 'Falha ao fazer upload da foto do pet'
                    ], 500);
                }
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
                'trace' => $e->getTraceAsString(),
                'validated_data' => $validated ?? null
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

            $isClearingPhoto = $request->has('photo') && !$request->hasFile('photo') && trim((string)$request->input('photo')) === '';
            if ($isClearingPhoto) {
                $publicId = $pet->getCloudinaryPublicId();
                if ($publicId) {
                    try { Cloudinary::destroy($publicId); } catch (\Exception $e) { /* ignore */ }
                }
                $validated['photo'] = null;
            }
            
            // Upload da nova foto se fornecida
            if ($request->hasFile('photo')) {
                // Remove a foto antiga do Cloudinary se existir
                $publicId = $pet->getCloudinaryPublicId();
                if ($publicId) {
                    try {
                        Cloudinary::destroy($publicId);
                    } catch (\Exception $e) {
                        Log::warning('Erro ao remover foto antiga do Cloudinary', [
                            'pet_id' => $pet->id,
                            'photo_public_id' => $publicId,
                            'error' => $e->getMessage()
                        ]);
                    }
                }

                $uploadedFileUrl = Cloudinary::upload($request->file('photo')->getRealPath())->getSecurePath();
                // manter consistência com a coluna 'photo'
                $validated['photo'] = $uploadedFileUrl;
            }

            $pet->update($validated);
            $pet->refresh();

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
