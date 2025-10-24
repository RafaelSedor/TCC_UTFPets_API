<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLocationRequest;
use App\Http\Requests\UpdateLocationRequest;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    /**
     * Lista todos os locations do usuário autenticado
     * 
     * GET /api/v1/locations
     */
    public function index(): JsonResponse
    {
        $locations = Location::forUser(auth()->id())
            ->withCount('pets')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($locations);
    }

    /**
     * Cria um novo location
     * 
     * POST /api/v1/locations
     */
    public function store(StoreLocationRequest $request): JsonResponse
    {
        $this->authorize('create', Location::class);

        $location = Location::create([
            'user_id' => auth()->id(),
            'name' => $request->name,
            'description' => $request->description,
            'timezone' => $request->timezone ?? 'America/Sao_Paulo',
        ]);

        return response()->json([
            'message' => 'Local criado com sucesso',
            'data' => $location->load('pets:id,name,location_id')
        ], 201);
    }

    /**
     * Exibe um location específico
     * 
     * GET /api/v1/locations/{location}
     */
    public function show(Location $location): JsonResponse
    {
        $this->authorize('view', $location);

        $location->loadCount('pets');
        $location->load('pets:id,name,species,location_id');

        return response()->json($location);
    }

    /**
     * Atualiza um location
     * 
     * PUT /api/v1/locations/{location}
     */
    public function update(UpdateLocationRequest $request, Location $location): JsonResponse
    {
        $this->authorize('update', $location);

        $location->update($request->validated());

        return response()->json([
            'message' => 'Local atualizado com sucesso',
            'data' => $location->load('pets:id,name,location_id')
        ]);
    }

    /**
     * Remove um location (soft delete)
     * 
     * DELETE /api/v1/locations/{location}
     */
    public function destroy(Location $location): JsonResponse
    {
        $this->authorize('delete', $location);

        // Verifica se há pets vinculados
        $petsCount = $location->pets()->count();
        
        if ($petsCount > 0) {
            return response()->json([
                'error' => 'Não é possível remover um local com pets vinculados. Remova ou transfira os pets primeiro.',
                'pets_count' => $petsCount
            ], 422);
        }

        $location->delete();

        return response()->json([
            'message' => 'Local removido com sucesso'
        ], 204);
    }
}

