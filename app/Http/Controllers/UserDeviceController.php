<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserDeviceController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(['message' => 'Devices not implemented'], 501);
    }

    public function register(Request $request): JsonResponse
    {
        return response()->json(['message' => 'Device register not implemented'], 501);
    }

    public function destroy(string $device): JsonResponse
    {
        return response()->json(['message' => 'Device delete not implemented'], 501);
    }
}

