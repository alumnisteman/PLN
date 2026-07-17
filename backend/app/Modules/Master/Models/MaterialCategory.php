<?php

namespace App\Modules\Master\Models;

use App\Models\BaseModel;

class MaterialCategory extends BaseModel
{
    protected $table = 'material_categories';

    protected $fillable = [
        'code', 'name', 'parent_code', 'description', 'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];
}
