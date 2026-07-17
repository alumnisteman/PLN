<?php

namespace App\Modules\Contract\Models;

use App\Models\BaseModel;
use App\Modules\Project\Models\Project;

class Contract extends BaseModel
{
    protected $table = 'contracts';

    protected $fillable = [
        'number', 'title', 'project_id', 'type', 'status',
        'value', 'client_name', 'signed_date', 'start_date', 'end_date',
        'scope', 'notes',
    ];

    protected $casts = [
        'value'       => 'decimal:2',
        'signed_date' => 'date',
        'start_date'  => 'date',
        'end_date'    => 'date',
        'created_at'  => 'datetime',
        'updated_at'  => 'datetime',
        'deleted_at'  => 'datetime',
    ];

    public function project() { return $this->belongsTo(Project::class); }
}
