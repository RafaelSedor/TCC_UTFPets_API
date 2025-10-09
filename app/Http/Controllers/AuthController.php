<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Routing\Controller as BaseController;

/*
|--------------------------------------------------------------------------
| Módulo 08 - Autenticação de Usuários
| Este controller gerencia o registro, login e logout de usuários
| utilizando JWT para autenticação.
*/


class AuthController extends BaseController
{
    public function __construct()
    {
        $this->middleware('jwt.auth', ['except' => ['login', 'register']]);
        $this->middleware('throttle:6,1')->only(['login', 'register']); // 6 tentativas por minuto
    }

    /**
     * Registra um novo usuário
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
                'regex:/[a-z]/',      // pelo menos uma letra minúscula
                'regex:/[A-Z]/',      // pelo menos uma letra maiúscula
                'regex:/[0-9]/',      // pelo menos um número
                'regex:/[@$!%*#?&]/', // pelo menos um caractere especial
            ]
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password)
        ]);

        $token = Auth::login($user);

        return response()->json([
            'message' => 'Registro realizado com sucesso',
            'user' => $user,
            'authorization' => [
                'token' => $token,
                'type' => 'bearer',
            ]
        ], 201);
    }

    /**
     * Realiza login do usuário
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:8'],
        ], [
            'email.required' => 'O campo e-mail é obrigatório',
            'email.email' => 'Por favor, forneça um e-mail válido',
            'password.required' => 'O campo senha é obrigatório',
            'password.min' => 'A senha deve ter pelo menos 8 caracteres'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Proteção contra timing attacks
        $credentials = $request->only('email', 'password');
        $user = User::where('email', $credentials['email'])->first();
        
        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'message' => 'E-mail ou senha inválidos',
            ], 401);
        }

        $token = Auth::login($user);

        return response()->json([
            'message' => 'Login realizado com sucesso',
            'user' => $user,
            'authorization' => [
                'token' => $token,
                'type' => 'bearer',
            ]
        ]);
    }

    /**
     * Realiza logout do usuário
     */
    public function logout(): JsonResponse
    {
        Auth::logout();
        return response()->json([
            'message' => 'Logout realizado com sucesso',
        ]);
    }

    /**
     * Retorna os dados do usuário autenticado
     */
    public function me(): JsonResponse
    {
        return response()->json(Auth::user());
    }
}
