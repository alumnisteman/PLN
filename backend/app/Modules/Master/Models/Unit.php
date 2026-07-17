<?php

namespace App\Modules\Master\Models;

use App\Models\BaseModel;

class Unit extends BaseModel
{
    protected $table = 'units';

    protected $fillable = [
        'code', 'name', 'symbol', 'description', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];
}
