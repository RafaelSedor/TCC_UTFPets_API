<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\User;
use App\Models\SharedLocation;
use App\Enums\InvitationStatus;
use App\Http\Requests\ShareLocationRequest;
use App\Http\Requests\UpdateSharedLocationRoleRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class SharedLocationController extends Controller
{
    /**
     * Lista todos os participantes de uma location
     */
    public function index(Location $location): JsonResponse
    {
        // Verifica se o usuário tem acesso à location
        if (!$location->hasAccess(auth()->user())) {
            abort(403, 'Você não tem permissão para visualizar esta location.');
        }

        $participants = $location->sharedWith()
            ->with(['user:id,name,email'])
            ->get()
            ->map(function ($shared) {
                return [
                    'user_id' => $shared->user_id,
                    'name' => $shared->user->name,
                    'email' => $shared->user->email,
                    'role' => $shared->role->value,
                    'invitation_status' => $shared->invitation_status->value,
                    'invited_by' => $shared->invited_by,
                    'created_at' => $shared->created_at,
                ];
            });

        return response()->json([
            'data' => $participants,
            'meta' => [
                'total' => $participants->count(),
                'pets_count' => $location->pets()->count(),
            ]
        ]);
    }

    /**
     * Compartilha uma location com outro usuário
     */
    public function store(ShareLocationRequest $request, Location $location): JsonResponse
    {
        // Apenas o dono da location pode compartilhar
        if ($location->user_id !== auth()->id()) {
            abort(403, 'Apenas o dono da location pode compartilhá-la.');
        }

        $validated = $request->validated();
        $role = $validated['role'];

        // Resolve o usuário
        $invitedUser = null;
        if (isset($validated['user_id'])) {
            $invitedUser = User::find($validated['user_id']);
        } elseif (isset($validated['email'])) {
            $invitedUser = User::where('email', $validated['email'])->first();
        }

        if (!$invitedUser) {
            return response()->json([
                'message' => 'Usuário não encontrado.',
            ], 422);
        }

        // Verifica se já existe um compartilhamento
        $existingShare = SharedLocation::where('location_id', $location->id)
            ->where('user_id', $invitedUser->id)
            ->first();

        if ($existingShare) {
            return response()->json([
                'message' => 'Este usuário já tem acesso a esta location.',
                'existing_role' => $existingShare->role->value,
                'status' => $existingShare->invitation_status->value,
            ], 422);
        }

        // Verifica se o usuário é o próprio dono
        if ($location->user_id === $invitedUser->id) {
            return response()->json([
                'message' => 'O dono da location não pode ser convidado para compartilhar.',
            ], 422);
        }

        DB::beginTransaction();
        try {
            $sharedLocation = SharedLocation::create([
                'location_id' => $location->id,
                'user_id' => $invitedUser->id,
                'role' => $role,
                'invitation_status' => InvitationStatus::PENDING,
                'invited_by' => auth()->id(),
            ]);

            DB::commit();

            $petsCount = $location->pets()->count();

            return response()->json([
                'message' => "Convite enviado com sucesso. O usuário terá acesso a {$petsCount} pet(s) desta location.",
                'data' => [
                    'user_id' => $sharedLocation->user_id,
                    'role' => $sharedLocation->role->value,
                    'invitation_status' => $sharedLocation->invitation_status->value,
                    'invited_by' => $sharedLocation->invited_by,
                    'pets_count' => $petsCount,
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erro ao enviar convite.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Usuário convidado aceita o convite
     */
    public function accept(Location $location, User $user): JsonResponse
    {
        // Verifica se o usuário autenticado é o convidado
        if (auth()->id() !== $user->id) {
            abort(403, 'Apenas o usuário convidado pode aceitar o convite.');
        }

        $sharedLocation = SharedLocation::where('location_id', $location->id)
            ->where('user_id', $user->id)
            ->where('invitation_status', InvitationStatus::PENDING)
            ->first();

        if (!$sharedLocation) {
            abort(404, 'Convite não encontrado ou já processado.');
        }

        DB::beginTransaction();
        try {
            $sharedLocation->update([
                'invitation_status' => InvitationStatus::ACCEPTED,
            ]);

            DB::commit();

            $petsCount = $location->pets()->count();

            return response()->json([
                'message' => "Convite aceito com sucesso. Você agora tem acesso a {$petsCount} pet(s).",
                'data' => [
                    'user_id' => $sharedLocation->user_id,
                    'role' => $sharedLocation->role->value,
                    'invitation_status' => $sharedLocation->invitation_status->value,
                    'pets_count' => $petsCount,
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erro ao aceitar convite.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Altera o papel de um participante
     */
    public function update(UpdateSharedLocationRoleRequest $request, Location $location, User $user): JsonResponse
    {
        // Apenas o dono da location pode alterar papéis
        if ($location->user_id !== auth()->id()) {
            abort(403, 'Apenas o dono da location pode alterar papéis.');
        }

        $validated = $request->validated();
        $newRole = $validated['role'];

        $sharedLocation = SharedLocation::where('location_id', $location->id)
            ->where('user_id', $user->id)
            ->where('invitation_status', InvitationStatus::ACCEPTED)
            ->first();

        if (!$sharedLocation) {
            abort(404, 'Compartilhamento não encontrado ou não aceito.');
        }

        // Não permite alterar o papel do dono
        if ($location->user_id === $user->id) {
            return response()->json([
                'message' => 'Não é possível alterar o papel do dono da location.',
            ], 422);
        }

        DB::beginTransaction();
        try {
            $oldRole = $sharedLocation->role;
            $sharedLocation->update(['role' => $newRole]);

            DB::commit();

            return response()->json([
                'message' => 'Papel atualizado com sucesso.',
                'data' => [
                    'user_id' => $sharedLocation->user_id,
                    'role' => $sharedLocation->role->value,
                    'previous_role' => $oldRole->value,
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erro ao atualizar papel.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Revoga o acesso de um participante
     */
    public function destroy(Location $location, User $user): JsonResponse
    {
        // Apenas o dono da location pode revogar acessos
        if ($location->user_id !== auth()->id()) {
            abort(403, 'Apenas o dono da location pode revogar acessos.');
        }

        $sharedLocation = SharedLocation::where('location_id', $location->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$sharedLocation) {
            abort(404, 'Compartilhamento não encontrado.');
        }

        // Não permite remover o próprio dono
        if ($location->user_id === $user->id) {
            return response()->json([
                'message' => 'Não é possível remover o dono da location.',
            ], 422);
        }

        DB::beginTransaction();
        try {
            $sharedLocation->delete();

            DB::commit();

            return response()->json([
                'message' => 'Acesso revogado com sucesso.',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erro ao revogar acesso.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
