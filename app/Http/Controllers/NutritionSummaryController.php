<?php

namespace App\Http\Controllers;

use App\Models\Pet;
use Illuminate\Http\JsonResponse;

class NutritionSummaryController extends Controller
{
    public function summary(Pet $pet): JsonResponse
    {
        return response()->json([
            'message' => 'Nutrition summary not implemented',
        ], 501);
    }
}

