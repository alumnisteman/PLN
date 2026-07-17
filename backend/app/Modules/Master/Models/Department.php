<?php

namespace App\Modules\Master\Models;

use App\Models\BaseModel;

class Department extends BaseModel
{
    protected $table = 'departments';

    protected $fillable = [
        'code', 'name', 'head_name', 'description', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];
}
