<?php

namespace App\Modules\Master\Models;

use App\Models\BaseModel;

class Position extends BaseModel
{
    protected $table = 'positions';

    protected $fillable = [
        'code', 'name', 'department', 'description', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];
}
