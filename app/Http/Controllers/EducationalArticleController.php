<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EducationalArticleController extends Controller
{
    // Public endpoints
    public function index(): JsonResponse
    {
        return response()->json(['message' => 'Educational articles not implemented'], 501);
    }

    public function show(string $slug): JsonResponse
    {
        return response()->json(['message' => 'Educational article not implemented'], 501);
    }

    // Admin endpoints
    public function store(Request $request): JsonResponse
    {
        return response()->json(['message' => 'Create educational article not implemented'], 501);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        return response()->json(['message' => 'Update educational article not implemented'], 501);
    }

    public function destroy(string $id): JsonResponse
    {
        return response()->json(['message' => 'Delete educational article not implemented'], 501);
    }

    public function publish(string $id): JsonResponse
    {
        return response()->json(['message' => 'Publish educational article not implemented'], 501);
    }

    public function drafts(): JsonResponse
    {
        return response()->json(['message' => 'Drafts not implemented'], 501);
    }

    public function duplicate(string $id): JsonResponse
    {
        return response()->json(['message' => 'Duplicate educational article not implemented'], 501);
    }
}

