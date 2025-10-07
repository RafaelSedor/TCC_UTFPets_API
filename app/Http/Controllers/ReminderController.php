<?php

namespace App\Http\Controllers;

use App\Models\Pet;
use App\Models\Reminder;
use App\Enums\ReminderStatus;
use App\Http\Requests\ReminderRequest;
use App\Http\Requests\UpdateReminderRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReminderController extends Controller
{
    /**
     * Lista todos os lembretes de um pet
     */
    public function index(Request $request, Pet $pet): JsonResponse
    {
        $this->authorize('view', $pet);

        $query = $pet->reminders();

        // Filtro por status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Filtro por data inicial
        if ($request->has('from')) {
            $query->where('scheduled_at', '>=', $request->from);
        }

        // Filtro por data final
        if ($request->has('to')) {
            $query->where('scheduled_at', '<=', $request->to);
        }

        $reminders = $query->orderBy('scheduled_at', 'asc')->get();

        return response()->json($reminders);
    }

    /**
     * Cria um novo lembrete
     */
    public function store(ReminderRequest $request, Pet $pet): JsonResponse
    {
        // Verifica se o usuário tem permissão para editar lembretes (owner ou editor)
        $accessService = app(\App\Services\AccessService::class);
        if (!$accessService->canEditMeals(auth()->user(), $pet)) {
            abort(403, 'Você não tem permissão para criar lembretes para este pet.');
        }

        DB::beginTransaction();
        try {
            $reminder = $pet->reminders()->create($request->validated());

            DB::commit();

            return response()->json([
                'message' => 'Lembrete criado com sucesso.',
                'data' => $reminder
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erro ao criar lembrete.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Exibe um lembrete específico
     */
    public function show(Reminder $reminder): JsonResponse
    {
        $this->authorize('view', $reminder->pet);

        return response()->json($reminder);
    }

    /**
     * Atualiza um lembrete
     */
    public function update(UpdateReminderRequest $request, Reminder $reminder): JsonResponse
    {
        // Verifica se o usuário tem permissão para editar lembretes (owner ou editor)
        $accessService = app(\App\Services\AccessService::class);
        if (!$accessService->canEditMeals(auth()->user(), $reminder->pet)) {
            abort(403, 'Você não tem permissão para editar este lembrete.');
        }

        DB::beginTransaction();
        try {
            $reminder->update($request->validated());

            DB::commit();

            return response()->json([
                'message' => 'Lembrete atualizado com sucesso.',
                'data' => $reminder
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erro ao atualizar lembrete.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove um lembrete
     */
    public function destroy(Reminder $reminder): JsonResponse
    {
        // Verifica se o usuário tem permissão para editar lembretes (owner ou editor)
        $accessService = app(\App\Services\AccessService::class);
        if (!$accessService->canEditMeals(auth()->user(), $reminder->pet)) {
            abort(403, 'Você não tem permissão para deletar este lembrete.');
        }

        DB::beginTransaction();
        try {
            $reminder->delete();

            DB::commit();

            return response()->json([
                'message' => 'Lembrete removido com sucesso.'
            ], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erro ao remover lembrete.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Adia um lembrete por X minutos
     */
    public function snooze(Request $request, Reminder $reminder): JsonResponse
    {
        // Verifica se o usuário tem permissão (qualquer pessoa com acesso ao pet)
        $this->authorize('view', $reminder->pet);

        $request->validate([
            'minutes' => 'required|integer|min:1|max:1440', // Máximo 24 horas
        ]);

        DB::beginTransaction();
        try {
            $reminder->snooze($request->minutes);

            DB::commit();

            return response()->json([
                'message' => "Lembrete adiado por {$request->minutes} minutos.",
                'data' => $reminder->fresh()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erro ao adiar lembrete.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Marca um lembrete como concluído
     */
    public function complete(Reminder $reminder): JsonResponse
    {
        // Verifica se o usuário tem permissão (owner ou editor)
        $accessService = app(\App\Services\AccessService::class);
        if (!$accessService->canEditMeals(auth()->user(), $reminder->pet)) {
            abort(403, 'Você não tem permissão para concluir este lembrete.');
        }

        DB::beginTransaction();
        try {
            $reminder->complete();

            // Se for recorrente, cria a próxima ocorrência
            if ($reminder->repeat_rule && $reminder->repeat_rule->isRecurring()) {
                $reminder->calculateNextOccurrence();
            }

            DB::commit();

            return response()->json([
                'message' => 'Lembrete marcado como concluído.',
                'data' => $reminder->fresh()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Erro ao concluir lembrete.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}

