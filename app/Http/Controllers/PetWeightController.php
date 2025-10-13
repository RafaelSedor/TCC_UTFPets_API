<?php

namespace App\Http\Controllers;

use App\Models\Pet;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PetWeightController extends Controller
{
    public function index(Pet $pet): JsonResponse
    {
        return response()->json(['message' => 'Pet weights not implemented'], 501);
    }

    public function store(Request $request, Pet $pet): JsonResponse
    {
        return response()->json(['message' => 'Pet weight create not implemented'], 501);
    }

    public function show(Pet $pet, string $petWeight): JsonResponse
    {
        return response()->json(['message' => 'Pet weight show not implemented'], 501);
    }

    public function update(Request $request, Pet $pet, string $petWeight): JsonResponse
    {
        return response()->json(['message' => 'Pet weight update not implemented'], 501);
    }

    public function destroy(Pet $pet, string $petWeight): JsonResponse
    {
        return response()->json(['message' => 'Pet weight delete not implemented'], 501);
    }
}

