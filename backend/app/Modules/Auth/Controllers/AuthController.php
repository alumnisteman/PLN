<?php

namespace App\Modules\Auth\Controllers;

use App\Http\Controllers\ApiController;
use App\Modules\Auth\Requests\LoginRequest;
use App\Modules\Auth\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AuthController extends ApiController
{
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->only('email', 'password');

        if (!Auth::attempt($credentials)) {
            return $this->error('Email atau password salah', 401);
        }

        $user = Auth::user();

        if (!$user->is_active) {
            Auth::logout();
            return $this->error('Akun Anda tidak aktif. Hubungi administrator.', 403);
        }

        $user->update(['last_login_at' => now()]);

        $token = $user->createToken('erp-token')->plainTextToken;

        return $this->success([
            'token' => $token,
            'user'  => new UserResource($user->load('roles.permissions')),
        ], 'Login berhasil');
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return $this->success(null, 'Logout berhasil');
    }

    public function me(Request $request): JsonResponse
    {
        return $this->resource(
            new UserResource($request->user()->load('roles.permissions'))
        );
    }
}
