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

/**
 * @OA\Tag(
 *     name="Auth",
 *     description="Autenticação de usuários via JWT"
 * )
 */

class AuthController extends BaseController
{
    public function __construct()
    {
        $this->middleware('jwt.auth', ['except' => ['login', 'register']]);
        $this->middleware('throttle:6,1')->only(['login', 'register']); // 6 tentativas por minuto
    }

    /**
     * @OA\Post(
     *     path="/api/auth/register",
     *     tags={"Auth"},
     *     summary="Registra um novo usuário",
     *     description="Cria uma nova conta de usuário e retorna o token JWT",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"name","email","password","password_confirmation"},
     *             @OA\Property(property="name", type="string", example="John Doe", description="Nome completo do usuário"),
     *             @OA\Property(property="email", type="string", format="email", example="john@example.com", description="Email único do usuário"),
     *             @OA\Property(property="password", type="string", format="password", example="Password@123", description="Senha com mínimo de 8 caracteres"),
     *             @OA\Property(property="password_confirmation", type="string", format="password", example="Password@123", description="Confirmação da senha")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Usuário registrado com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Registro realizado com sucesso"),
     *             @OA\Property(property="user", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="John Doe"),
     *                 @OA\Property(property="email", type="string", example="john@example.com"),
     *                 @OA\Property(property="created_at", type="string", format="date-time", example="2024-03-20T10:00:00Z"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time", example="2024-03-20T10:00:00Z")
     *             ),
     *             @OA\Property(property="authorization", type="object",
     *                 @OA\Property(property="token", type="string", example="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."),
     *                 @OA\Property(property="type", type="string", example="bearer")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Erros de validação",
     *         @OA\JsonContent(
     *             @OA\Property(property="errors", type="object",
     *                 @OA\Property(property="email", type="array", @OA\Items(type="string", example="O email já está em uso")),
     *                 @OA\Property(property="password", type="array", @OA\Items(type="string", example="A senha deve ter pelo menos 8 caracteres"))
     *             )
     *         )
     *     )
     * )
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
     * @OA\Post(
     *     path="/api/auth/login",
     *     tags={"Auth"},
     *     summary="Realiza login do usuário",
     *     description="Autentica o usuário e retorna o token JWT",
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"email","password"},
     *             @OA\Property(property="email", type="string", format="email", example="john@example.com", description="Email do usuário"),
     *             @OA\Property(property="password", type="string", format="password", example="Password@123", description="Senha do usuário")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Login realizado com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Login realizado com sucesso"),
     *             @OA\Property(property="user", type="object",
     *                 @OA\Property(property="id", type="integer", example=1),
     *                 @OA\Property(property="name", type="string", example="John Doe"),
     *                 @OA\Property(property="email", type="string", example="john@example.com"),
     *                 @OA\Property(property="created_at", type="string", format="date-time", example="2024-03-20T10:00:00Z"),
     *                 @OA\Property(property="updated_at", type="string", format="date-time", example="2024-03-20T10:00:00Z")
     *             ),
     *             @OA\Property(property="authorization", type="object",
     *                 @OA\Property(property="token", type="string", example="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."),
     *                 @OA\Property(property="type", type="string", example="bearer")
     *             )
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Credenciais inválidas",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="E-mail ou senha inválidos")
     *         )
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Erros de validação",
     *         @OA\JsonContent(
     *             @OA\Property(property="errors", type="object",
     *                 @OA\Property(property="email", type="array", @OA\Items(type="string", example="O campo email é obrigatório")),
     *                 @OA\Property(property="password", type="array", @OA\Items(type="string", example="O campo senha é obrigatório"))
     *             )
     *         )
     *     )
     * )
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
     * @OA\Post(
     *     path="/api/auth/logout",
     *     tags={"Auth"},
     *     summary="Realiza logout do usuário",
     *     description="Invalida o token JWT atual",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Logout realizado com sucesso",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Logout realizado com sucesso")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Não autorizado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Token inválido ou expirado")
     *         )
     *     )
     * )
     */
    public function logout(): JsonResponse
    {
        Auth::logout();
        return response()->json([
            'message' => 'Logout realizado com sucesso',
        ]);
    }

    /**
     * @OA\Get(
     *     path="/api/auth/me",
     *     tags={"Auth"},
     *     summary="Retorna os dados do usuário autenticado",
     *     security={{"bearerAuth":{}}},
     *     @OA\Response(
     *         response=200,
     *         description="Dados do usuário autenticado",
     *         @OA\JsonContent(
     *             @OA\Property(property="id", type="integer", example=1),
     *             @OA\Property(property="name", type="string", example="John Doe"),
     *             @OA\Property(property="email", type="string", format="email", example="john@example.com"),
     *             @OA\Property(property="created_at", type="string", format="date-time"),
     *             @OA\Property(property="updated_at", type="string", format="date-time")
     *         )
     *     ),
     *     @OA\Response(
     *         response=401,
     *         description="Não autorizado",
     *         @OA\JsonContent(
     *             @OA\Property(property="message", type="string", example="Token inválido ou expirado")
     *         )
     *     )
     * )
     */
    public function me(): JsonResponse
    {
        return response()->json(Auth::user());
    }
}
