<?php

namespace App\Http\Controllers;

use App\Models\PushSubscription;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class PushSubscriptionController extends Controller
{
    /**
     * Store a push subscription
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'endpoint' => 'required|string',
            'keys' => 'required|array',
            'keys.p256dh' => 'required|string',
            'keys.auth' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = auth()->user();

        // Check if subscription already exists for this user and endpoint
        $subscription = PushSubscription::updateOrCreate(
            [
                'user_id' => $user->id,
                'endpoint' => $request->endpoint,
            ],
            [
                'p256dh' => $request->keys['p256dh'],
                'auth' => $request->keys['auth'],
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Push subscription saved successfully',
            'data' => [
                'id' => $subscription->id,
                'endpoint' => $subscription->endpoint,
            ],
        ], 201);
    }

    /**
     * Delete a push subscription
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function destroy(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'endpoint' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = auth()->user();

        $deleted = PushSubscription::where('user_id', $user->id)
            ->where('endpoint', $request->endpoint)
            ->delete();

        if ($deleted) {
            return response()->json([
                'success' => true,
                'message' => 'Push subscription deleted successfully',
            ], 200);
        }

        return response()->json([
            'success' => false,
            'message' => 'Push subscription not found',
        ], 404);
    }

    /**
     * Get all push subscriptions for the authenticated user
     *
     * @return JsonResponse
     */
    public function index(): JsonResponse
    {
        $user = auth()->user();
        $subscriptions = $user->pushSubscriptions;

        return response()->json([
            'success' => true,
            'data' => $subscriptions->map(function ($subscription) {
                return [
                    'id' => $subscription->id,
                    'endpoint' => $subscription->endpoint,
                    'created_at' => $subscription->created_at->toIso8601String(),
                ];
            }),
        ], 200);
    }
}
