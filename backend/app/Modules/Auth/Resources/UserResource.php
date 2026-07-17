<?php

namespace App\Modules\Auth\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid'          => $this->uuid,
            'name'          => $this->name,
            'email'         => $this->email,
            'phone'         => $this->phone,
            'avatar'        => $this->avatar,
            'is_active'     => $this->is_active,
            'last_login_at' => $this->last_login_at?->toIso8601String(),
            'roles'         => $this->roles->map(fn($r) => [
                'name'         => $r->name,
                'display_name' => $r->display_name ?? $r->name,
            ]),
            'permissions'   => $this->getAllPermissions()->pluck('name'),
            'created_at'    => $this->created_at?->toIso8601String(),
        ];
    }
}
