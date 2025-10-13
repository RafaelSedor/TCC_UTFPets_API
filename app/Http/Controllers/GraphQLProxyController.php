<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GraphQLProxyController extends Controller
{
    public function read(Request $request): JsonResponse
    {
        return response()->json(['message' => 'GraphQL proxy not implemented'], 501);
    }
}

