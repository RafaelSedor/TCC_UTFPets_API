<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    /**
     * Lista todas as notificações do usuário autenticado
     */
    public function index(Request $request): JsonResponse
    {
        $query = Notification::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc');

        // Filtro por status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Paginação
        $perPage = $request->input('per_page', 20);
        $notifications = $query->paginate($perPage);

        return response()->json([
            'data' => $notifications->items(),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
                'last_page' => $notifications->lastPage(),
                'unread_count' => $this->notificationService->countUnread(auth()->user()),
            ]
        ]);
    }

    /**
     * Marca uma notificação como lida
     */
    public function markAsRead(Notification $notification): JsonResponse
    {
        // Verifica se a notificação pertence ao usuário autenticado
        if ($notification->user_id !== auth()->id()) {
            abort(403, 'Você não tem permissão para acessar esta notificação.');
        }

        $this->notificationService->markAsRead($notification);

        return response()->json([
            'message' => 'Notificação marcada como lida.',
            'data' => $notification->fresh()
        ]);
    }

    /**
     * Marca todas as notificações como lidas
     */
    public function markAllAsRead(): JsonResponse
    {
        $count = $this->notificationService->markAllAsRead(auth()->user());

        return response()->json([
            'message' => "{$count} notificações marcadas como lidas.",
            'count' => $count
        ]);
    }

    /**
     * Conta notificações não lidas
     */
    public function unreadCount(): JsonResponse
    {
        $count = $this->notificationService->countUnread(auth()->user());

        return response()->json([
            'unread_count' => $count
        ]);
    }
}

