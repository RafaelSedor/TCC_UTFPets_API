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

/**
 * @OA\Tag(
 *     name="Pets",
 *     description="API Endpoints de gerenciamento de pets"
 * )
 */
class PetController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/v1/pets",
     *     tags={"Pets"},
     *     summary="Lista todos os pets do usuário",
     *     description="Retorna uma lista de todos os pets cadastrados pelo usuário autenticado",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Lista de pets",
     *         @OA\JsonContent(
     *             type="array",
     *             @OA\Items(ref="#/components/schemas/Pet")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Não autorizado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Não autorizado")
     *         )
     *     )
     * )
     */
    public function index(): JsonResponse
    {
        $user = Auth::user();
        $pets = Pet::where('user_id', $user->id)->paginate(10);
        return response()->json($pets);
    }

    /**
     * @OA\Post(
     *     path="/api/v1/pets",
     *     tags={"Pets"},
     *     summary="Cria um novo pet",
     *     description="Cadastra um novo pet para o usuário autenticado",
     *     security={{"bearerAuth":{}}},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 required={"name","species","photo"},
     *                 @OA\Property(property="name", type="string", description="Nome do pet", example="Rex"),
     *                 @OA\Property(property="species", type="string", description="Espécie do pet", example="Cachorro"),
     *                 @OA\Property(property="breed", type="string", description="Raça do pet", example="Labrador", nullable=true),
     *                 @OA\Property(property="birth_date", type="string", format="date", description="Data de nascimento", example="2020-01-01", nullable=true),
     *                 @OA\Property(property="weight", type="number", format="float", description="Peso em kg", example=25.5, nullable=true),
     *                 @OA\Property(property="photo", type="file", format="binary", description="Foto do pet"),
     *                 @OA\Property(property="notes", type="string", description="Observações sobre o pet", example="Cachorro muito dócil", nullable=true)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Pet criado com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Pet cadastrado com sucesso"),
     *             @OA\Property(property="pet", ref="#/components/schemas/Pet")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Erros de validação",
     *         @OA\JsonContent(
     *             @OA\Property(property="errors", type="object",
     *                 @OA\Property(property="name", type="array", @OA\Items(type="string", example="O campo nome é obrigatório")),
     *                 @OA\Property(property="species", type="array", @OA\Items(type="string", example="O campo espécie é obrigatório")),
     *                 @OA\Property(property="photo", type="array", @OA\Items(type="string", example="O campo foto é obrigatório"))
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Não autorizado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Não autorizado")
     *         )
     *     )
     * )
     */
    public function store(PetStoreRequest $request): JsonResponse
    {
        try {
            $data = $request->validated();
            $data['user_id'] = Auth::id();

            $pet = app(\App\Services\PetService::class)->create($data);

            return response()->json([
                'message' => 'Pet cadastrado com sucesso',
                'pet' => $pet
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao cadastrar pet',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/v1/pets/{id}",
     *     tags={"Pets"},
     *     summary="Retorna os detalhes de um pet",
     *     description="Retorna informações detalhadas de um pet específico, incluindo suas refeições",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID do pet",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Detalhes do pet",
     *         @OA\JsonContent(ref="#/components/schemas/Pet")
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Pet não encontrado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Pet não encontrado")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Acesso negado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthorized")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Não autorizado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Não autorizado")
     *         )
     *     )
     * )
     */
    public function show(Pet $pet): JsonResponse
    {
        $this->authorize('view', $pet);
        return response()->json($pet->load('meals'));
    }

    /**
     * @OA\Post(
     *     path="/api/v1/pets/{id}",
     *     tags={"Pets"},
     *     summary="Atualiza um pet",
     *     description="Atualiza as informações de um pet existente",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID do pet",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\MediaType(
     *             mediaType="multipart/form-data",
     *             @OA\Schema(
     *                 @OA\Property(property="name", type="string", description="Nome do pet", example="Rex"),
     *                 @OA\Property(property="species", type="string", description="Espécie do pet", example="Cachorro"),
     *                 @OA\Property(property="breed", type="string", description="Raça do pet", example="Labrador", nullable=true),
     *                 @OA\Property(property="birth_date", type="string", format="date", description="Data de nascimento", example="2020-01-01", nullable=true),
     *                 @OA\Property(property="weight", type="number", format="float", description="Peso em kg", example=25.5, nullable=true),
     *                 @OA\Property(property="photo", type="file", format="binary", description="Foto do pet"),
     *                 @OA\Property(property="notes", type="string", description="Observações sobre o pet", example="Cachorro muito dócil", nullable=true)
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Pet atualizado com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Pet atualizado com sucesso"),
     *             @OA\Property(property="pet", ref="#/components/schemas/Pet")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Erros de validação",
     *         @OA\JsonContent(
     *             @OA\Property(property="errors", type="object")
     *         )
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Pet não encontrado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Pet não encontrado")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Acesso negado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthorized")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Não autorizado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Não autorizado")
     *         )
     *     )
     * )
     */
    public function update(PetUpdateRequest $request, Pet $pet): JsonResponse
    {
        $this->authorize('update', $pet);

        try {
            Log::info('Requisição recebida para update:', $request->all());

            $data = $request->all();
            $pet = app(\App\Services\PetService::class)->update($pet, $data);

            return response()->json([
                'message' => 'Pet atualizado com sucesso',
                'pet' => $pet
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao atualizar pet',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Delete(
     *     path="/api/v1/pets/{id}",
     *     tags={"Pets"},
     *     summary="Remove um pet",
     *     description="Remove um pet existente (soft delete)",
     *     security={{"bearerAuth":{}}},
     *     @OA\Parameter(
     *         name="id",
     *         in="path",
     *         required=true,
     *         description="ID do pet",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=204,
     *         description="Pet removido com sucesso"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Pet não encontrado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Pet não encontrado")
     *         )
     *     ),
     *     @OA\Response(
     *         response=403,
     *         description="Acesso negado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Unauthorized")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Não autorizado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Não autorizado")
     *         )
     *     )
     * )
     */
    public function destroy(Pet $pet): JsonResponse
    {
        $this->authorize('delete', $pet);

        if ($pet->photo) {
            $publicId = $pet->getCloudinaryPublicId();
            Cloudinary::destroy($publicId);
        }

        $pet->delete();
        return response()->json(null, 204);
    }
}
