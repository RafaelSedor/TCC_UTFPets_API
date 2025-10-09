<?php

namespace App\Exceptions;

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Throwable;

class Handler extends ExceptionHandler
{

    /**
     * Handle unauthenticated requests.
     */
    protected function unauthenticated($request, AuthenticationException $exception)
    {
        return $request->expectsJson()
            ? response()->json(['message' => 'Unauthenticated'], 401)
            : abort(401, 'Unauthorized');
    }

    public function render($request, Throwable $exception): JsonResponse
    {
        // Força o request a sempre esperar JSON
        $request->headers->set('Accept', 'application/json');

        if ($request->wantsJson()) {
            $status = 500;
            $message = 'Erro interno no servidor';

            if ($exception instanceof \Illuminate\Auth\AuthenticationException) {
                $status = 401;
                $message = 'Não autenticado';
            } elseif ($exception instanceof \Illuminate\Validation\ValidationException) {
                return response()->json([
                    'message' => 'Erro de validação',
                    'errors' => $exception->errors(),
                ], 422);
            } elseif ($exception instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException) {
                $status = 404;
                $message = 'Rota não encontrada';
            } elseif ($exception instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                $status = 404;
                $message = 'Recurso não encontrado';
            } elseif ($exception instanceof \Symfony\Component\HttpKernel\Exception\MethodNotAllowedHttpException) {
                $status = 405;
                $message = 'Método não permitido';
            }

            return response()->json([
                'message' => $message,
                'status' => $status
            ], $status);
        }

        return parent::render($request, $exception);
    }
}
