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
     *     path="/api/pets",
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
        $pets = Auth::user()->pets;
        return response()->json($pets);
    }

    /**
     * @OA\Post(
     *     path="/api/pets",
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

            if ($request->hasFile('photo')) {
                $uploadedFile = $request->file('photo');
                $result = Cloudinary::upload($uploadedFile->getRealPath());
                $data['photo'] = $result->getSecurePath();
            }

            $pet = Pet::create($data);

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
     *     path="/api/pets/{id}",
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
        if ($pet->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json($pet->load('meals'));
    }

    /**
     * @OA\Put(
     *     path="/api/pets/{id}",
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
     *                 type="object",
     *                 @OA\Property(property="name", type="string", description="Nome do pet", example="Rex"),
     *                 @OA\Property(property="species", type="string", description="Espécie do pet", example="Cachorro"),
     *                 @OA\Property(property="breed", type="string", description="Raça do pet", example="Labrador", nullable=true),
     *                 @OA\Property(property="birth_date", type="string", format="date", description="Data de nascimento", example="2020-01-01", nullable=true),
     *                 @OA\Property(property="weight", type="number", format="float", description="Peso em kg", example=25.5, nullable=true),
     *                 @OA\Property(property="photo", type="file", format="binary", description="Nova foto do pet"),
     *                 @OA\Property(property="notes", type="string", description="Observações sobre o pet", example="Cachorro muito dócil", nullable=true)
     *             )
     *         ),
     *         @OA\MediaType(
     *             mediaType="application/json",
     *             @OA\Schema(
     *                 type="object",
     *                 @OA\Property(property="name", type="string", description="Nome do pet", example="Rex"),
     *                 @OA\Property(property="species", type="string", description="Espécie do pet", example="Cachorro"),
     *                 @OA\Property(property="breed", type="string", description="Raça do pet", example="Labrador", nullable=true),
     *                 @OA\Property(property="birth_date", type="string", format="date", description="Data de nascimento", example="2020-01-01", nullable=true),
     *                 @OA\Property(property="weight", type="number", format="float", description="Peso em kg", example=25.5, nullable=true),
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
        if ($pet->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            $data = $request->validated();

            // Remove campos vazios para não sobrescrever dados existentes
            $data = array_filter($data, function ($value) {
                return $value !== null && $value !== '';
            });

            if ($request->hasFile('photo')) {
                if ($pet->photo) {
                    $publicId = substr(strrchr($pet->photo, '/'), 1);
                    Cloudinary::destroy($publicId);
                }

                $uploadedFile = $request->file('photo');
                $result = Cloudinary::upload($uploadedFile->getRealPath());
                $data['photo'] = $result->getSecurePath();
            } elseif (isset($data['photo'])) {
                // Se photo foi enviado mas não é um arquivo, remove do array
                unset($data['photo']);
            }

            $pet->update($data);
            $pet->refresh();
            
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
     *     path="/api/pets/{id}",
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
        if ($pet->user_id !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($pet->photo) {
            $publicId = substr(strrchr($pet->photo, '/'), 1);
            Cloudinary::destroy($publicId);
        }

        $pet->delete();
        return response()->json(null, 204);
    }
}
