<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\EducationalArticle;
use App\Models\Pet;
use App\Models\Reminder;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class AdminController extends Controller
{
    /**
     * Lista usuários com filtros e paginação
     * 
     * GET /api/v1/admin/users?email=&created_from=&created_to=&page=&per_page=
     */
    public function listUsers(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'nullable|string|max:255',
            'created_from' => 'nullable|date',
            'created_to' => 'nullable|date',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $query = User::query();

        // Filtro por email (busca parcial)
        if ($request->has('email')) {
            $query->where('email', 'like', '%' . $request->email . '%');
        }

        // Filtro por data de criação
        if ($request->has('created_from')) {
            $query->where('created_at', '>=', $request->created_from);
        }

        if ($request->has('created_to')) {
            $query->where('created_at', '<=', $request->created_to);
        }

        // Ordenar por criação mais recente
        $query->orderBy('created_at', 'desc');

        // Paginação
        $perPage = $request->get('per_page', 20);
        $users = $query->paginate($perPage);

        // Log de acesso
        AuditService::log('list_users', 'User', null, null, [
            'filters' => $request->only(['email', 'created_from', 'created_to']),
            'total' => $users->total(),
        ]);

        return response()->json([
            'data' => $users->items(),
            'meta' => [
                'total' => $users->total(),
                'per_page' => $users->perPage(),
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
            ]
        ]);
    }

    /**
     * Atualiza status de admin de um usuário
     * 
     * PATCH /api/v1/admin/users/{id}
     */
    public function updateUser(Request $request, $id): JsonResponse
    {
        $request->validate([
            'is_admin' => 'required|boolean',
        ]);

        $user = User::findOrFail($id);
        
        $oldValue = $user->is_admin;
        $newValue = $request->is_admin;

        // Não permite que o admin remova seu próprio acesso
        if ($user->id === auth()->id() && !$newValue) {
            return response()->json([
                'error' => 'Você não pode remover seu próprio acesso de admin'
            ], 422);
        }

        $user->is_admin = $newValue;
        $user->save();

        // Log da alteração
        AuditService::logUpdated(
            'User',
            (string)$user->id,
            ['is_admin' => $oldValue],
            ['is_admin' => $newValue]
        );

        return response()->json([
            'message' => 'Permissões de admin atualizadas com sucesso',
            'user' => $user
        ]);
    }

    /**
     * Lista pets com filtros e paginação
     * 
     * GET /api/v1/admin/pets?owner_id=&page=&per_page=
     */
    public function listPets(Request $request): JsonResponse
    {
        $request->validate([
            'owner_id' => 'nullable|integer|exists:users,id',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $query = Pet::with('user:id,name,email');

        // Filtro por dono
        if ($request->has('owner_id')) {
            $query->where('user_id', $request->owner_id);
        }

        // Ordenar por criação mais recente
        $query->orderBy('created_at', 'desc');

        // Paginação
        $perPage = $request->get('per_page', 20);
        $pets = $query->paginate($perPage);

        // Log de acesso
        AuditService::log('list_pets', 'Pet', null, null, [
            'filters' => $request->only(['owner_id']),
            'total' => $pets->total(),
        ]);

        return response()->json([
            'data' => $pets->items(),
            'meta' => [
                'total' => $pets->total(),
                'per_page' => $pets->perPage(),
                'current_page' => $pets->currentPage(),
                'last_page' => $pets->lastPage(),
            ]
        ]);
    }

    /**
     * Lista logs de auditoria com filtros e paginação
     * 
     * GET /api/v1/admin/audit-logs?action=&entity_type=&user_id=&from=&to=&page=&per_page=
     */
    public function listAuditLogs(Request $request): JsonResponse
    {
        $request->validate([
            'action' => 'nullable|string|max:255',
            'entity_type' => 'nullable|string|max:255',
            'user_id' => 'nullable|integer|exists:users,id',
            'from' => 'nullable|date',
            'to' => 'nullable|date',
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
        ]);

        $query = AuditLog::with('user:id,name,email');

        // Filtros
        if ($request->has('action')) {
            $query->byAction($request->action);
        }

        if ($request->has('entity_type')) {
            $query->byEntityType($request->entity_type);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('from') || $request->has('to')) {
            $query->dateRange($request->from, $request->to);
        }

        // Ordenar por mais recente
        $query->orderBy('created_at', 'desc');

        // Paginação
        $perPage = $request->get('per_page', 50);
        $logs = $query->paginate($perPage);

        return response()->json([
            'data' => $logs->items(),
            'meta' => [
                'total' => $logs->total(),
                'per_page' => $logs->perPage(),
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
            ]
        ]);
    }

    /**
     * Visão geral de estatísticas da plataforma
     * 
     * GET /api/v1/admin/stats/overview
     * 
     * @OA\Get(
     *     path="/v1/admin/stats/overview",
     *     summary="Estatísticas gerais da plataforma",
     *     tags={"Admin"},
     *     security={{"bearerAuth": {}}},
     *     @OA\Response(
     *         response=200,
     *         description="Estatísticas gerais",
     *         @OA\JsonContent(
     *             @OA\Property(property="users", type="object",
     *                 @OA\Property(property="total", type="integer"),
     *                 @OA\Property(property="admins", type="integer")
     *             ),
     *             @OA\Property(property="pets", type="object",
     *                 @OA\Property(property="total", type="integer")
     *             ),
     *             @OA\Property(property="reminders", type="object",
     *                 @OA\Property(property="active", type="integer")
     *             ),
     *             @OA\Property(property="educational_articles", type="object",
     *                 @OA\Property(property="published", type="integer"),
     *                 @OA\Property(property="drafts", type="integer")
     *             )
     *         )
     *     ),
     *     @OA\Response(response=403, description="Forbidden")
     * )
     */
    public function overview(): JsonResponse
    {
        $stats = [
            'users' => [
                'total' => User::count(),
                'admins' => User::where('is_admin', true)->count(),
            ],
            'pets' => [
                'total' => Pet::count(),
            ],
            'reminders' => [
                'active' => Reminder::where('status', 'active')->count(),
            ],
            'educational_articles' => [
                'published' => EducationalArticle::whereNotNull('published_at')
                    ->where('published_at', '<=', now())
                    ->count(),
                'drafts' => EducationalArticle::whereNull('published_at')
                    ->orWhere('published_at', '>', now())
                    ->count(),
            ],
        ];

        // Log do acesso às estatísticas
        AuditService::log('view_overview_stats', 'Admin', null, null, $stats);

        return response()->json($stats);
    }
}

