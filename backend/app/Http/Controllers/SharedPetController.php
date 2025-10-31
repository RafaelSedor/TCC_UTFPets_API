<?php

namespace App\Http\Controllers;

use App\Models\Pet;
use App\Models\User;
use App\Models\SharedPet;
use App\Enums\InvitationStatus;
use App\Http\Requests\SharePetRequest;
use App\Http\Requests\UpdateSharedPetRoleRequest;
use App\Events\SharedPetInvited;
use App\Events\SharedPetAccepted;
use App\Events\SharedPetRoleChanged;
use App\Events\SharedPetRemoved;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class SharedPetController extends Controller
{
    /**
     * Lista todos os pets compartilhados PELO usuário autenticado (by-me)
     */
    public function sharedByMe(): JsonResponse
    {
        $user = auth()->user();

        // Busca todos os pets que o usuário possui e que foram compartilhados
        $sharedPets = SharedPet::whereHas('pet', function($query) use ($user) {
            $query->where('user_id', $user->id);
        })
        ->with(['pet:id,name,species,photo', 'user:id,name,email'])
        ->get()
        ->map(function($shared) {
            return [
                'id' => $shared->id,
                'pet_id' => $shared->pet_id,
                'pet' => $shared->pet,
                'user_id' => $shared->user_id,
                'shared_with_user' => $shared->user,
                'permission_level' => $shared->role->value === 'editor' ? 'write' : 'read',
                'invitation_status' => $shared->invitation_status->value,
                'created_at' => $shared->created_at,
            ];
        });

        return response()->json($sharedPets);
    }

    /**
     * Lista todos os pets compartilhados COM o usuário autenticado (with-me)
     */
    public function sharedWithMe(): JsonResponse
    {
        $user = auth()->user();

        // Busca todos os compartilhamentos onde o usuário foi convidado
        $sharedPets = SharedPet::where('user_id', $user->id)
            ->with(['pet:id,name,species,photo,user_id', 'pet.owner:id,name,email'])
            ->get()
            ->map(function($shared) {
                $petData = [
                    'id' => $shared->pet->id,
                    'name' => $shared->pet->name,
                    'species' => $shared->pet->species,
                    'photo_url' => $shared->pet->photo,
                    'owner' => $shared->pet->owner ? [
                        'id' => $shared->pet->owner->id,
                        'name' => $shared->pet->owner->name,
                        'email' => $shared->pet->owner->email,
                    ] : null,
                ];

                return [
                    'id' => $shared->id,
                    'pet_id' => $shared->pet_id,
                    'user_id' => $shared->user_id,
                    'pet' => $petData,
                    'permission_level' => $shared->role->value === 'editor' ? 'write' : 'read',
                    'invitation_status' => $shared->invitation_status->value,
                    'created_at' => $shared->created_at,
                ];
            });

        return response()->json($sharedPets);
    }

    /**
     * Lista todos os participantes de um pet
     */
    public function index(Pet $pet): JsonResponse
    {
        $this->authorize('view', $pet);

        $participants = $pet->sharedWith()
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
            ]
        ]);
    }

    /**
     * Compartilha um pet com outro usuário
     */
    public function store(SharePetRequest $request, Pet $pet): JsonResponse
    {
        $this->authorize('manageSharing', $pet);

        $validated = $request->validated();
        $role = $validated['role'];
        
        // Resolve o usuário
        $invitedUser = null;
        if (isset($validated['user_id'])) {
            $invitedUser = \App\Models\User::find($validated['user_id']);
        } elseif (isset($validated['email'])) {
            $invitedUser = \App\Models\User::where('email', $validated['email'])->first();
        }
        
        if (!$invitedUser) {
            return response()->json([
                'message' => 'Usuário não encontrado.',
            ], 422);
        }

        // Verifica se já existe um compartilhamento
        $existingShare = SharedPet::where('pet_id', $pet->id)
            ->where('user_id', $invitedUser->id)
            ->first();

        if ($existingShare) {
            return response()->json([
                'message' => 'Este usuário já tem acesso a este pet.',
                'existing_role' => $existingShare->role->value,
                'status' => $existingShare->invitation_status->value,
            ], 422);
        }

        // Verifica se o usuário é o próprio dono
        if ($pet->user_id === $invitedUser->id) {
            return response()->json([
                'message' => 'O dono do pet não pode ser convidado para compartilhar.',
            ], 422);
        }

        DB::beginTransaction();
        try {
            $sharedPet = SharedPet::create([
                'pet_id' => $pet->id,
                'user_id' => $invitedUser->id,
                'role' => $role,
                'invitation_status' => InvitationStatus::PENDING,
                'invited_by' => auth()->id(),
            ]);

            // Dispara evento
            event(new SharedPetInvited($sharedPet, auth()->user()));

            DB::commit();

            return response()->json([
                'message' => 'Convite enviado com sucesso.',
                'data' => [
                    'user_id' => $sharedPet->user_id,
                    'role' => $sharedPet->role->value,
                    'invitation_status' => $sharedPet->invitation_status->value,
                    'invited_by' => $sharedPet->invited_by,
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
    public function accept(Pet $pet, User $user): JsonResponse
    {
        // Verifica se o usuário autenticado é o convidado
        if (auth()->id() !== $user->id) {
            abort(403, 'Apenas o usuário convidado pode aceitar o convite.');
        }

        $sharedPet = SharedPet::where('pet_id', $pet->id)
            ->where('user_id', $user->id)
            ->where('invitation_status', InvitationStatus::PENDING)
            ->first();

        if (!$sharedPet) {
            abort(404, 'Convite não encontrado ou já processado.');
        }

        DB::beginTransaction();
        try {
            $sharedPet->update([
                'invitation_status' => InvitationStatus::ACCEPTED,
            ]);

            // Dispara evento
            event(new SharedPetAccepted($sharedPet, $user));

            DB::commit();

            return response()->json([
                'message' => 'Convite aceito com sucesso.',
                'data' => [
                    'user_id' => $sharedPet->user_id,
                    'role' => $sharedPet->role->value,
                    'invitation_status' => $sharedPet->invitation_status->value,
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
    public function update(UpdateSharedPetRoleRequest $request, Pet $pet, User $user): JsonResponse
    {
        $this->authorize('manageSharing', $pet);

        $validated = $request->validated();
        $newRole = $validated['role'];

        $sharedPet = SharedPet::where('pet_id', $pet->id)
            ->where('user_id', $user->id)
            ->where('invitation_status', InvitationStatus::ACCEPTED)
            ->first();

        if (!$sharedPet) {
            abort(404, 'Compartilhamento não encontrado ou não aceito.');
        }

        // Não permite alterar o papel do dono
        if ($pet->user_id === $user->id) {
            return response()->json([
                'message' => 'Não é possível alterar o papel do dono do pet.',
            ], 422);
        }

        DB::beginTransaction();
        try {
            $oldRole = $sharedPet->role;
            $sharedPet->update(['role' => $newRole]);

            // Dispara evento
            event(new SharedPetRoleChanged($sharedPet, $oldRole, $sharedPet->role));

            DB::commit();

            return response()->json([
                'message' => 'Papel atualizado com sucesso.',
                'data' => [
                    'user_id' => $sharedPet->user_id,
                    'role' => $sharedPet->role->value,
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
    public function destroy(Pet $pet, User $user): JsonResponse
    {
        $this->authorize('manageSharing', $pet);

        $sharedPet = SharedPet::where('pet_id', $pet->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$sharedPet) {
            abort(404, 'Compartilhamento não encontrado.');
        }

        // Não permite remover o próprio dono
        if ($pet->user_id === $user->id) {
            return response()->json([
                'message' => 'Não é possível remover o dono do pet.',
            ], 422);
        }

        DB::beginTransaction();
        try {
            // Dispara evento antes de remover
            event(new SharedPetRemoved($sharedPet, auth()->user()));

            $sharedPet->delete();

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