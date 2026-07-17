<?php

namespace App\Modules\Project\Models;

use App\Models\BaseModel;
use App\Models\User;

class Project extends BaseModel
{
    protected $table = 'projects';

    protected $fillable = [
        'code', 'name', 'description', 'client_name', 'client_contact',
        'location', 'province', 'city', 'type', 'status',
        'contract_value', 'boq_value', 'start_date', 'end_date',
        'progress_percent', 'project_manager_id', 'site_engineer_id', 'members',
    ];

    protected $casts = [
        'contract_value'   => 'decimal:2',
        'boq_value'        => 'decimal:2',
        'progress_percent' => 'decimal:2',
        'start_date'       => 'date',
        'end_date'         => 'date',
        'members'          => 'array',
        'created_at'       => 'datetime',
        'updated_at'       => 'datetime',
        'deleted_at'       => 'datetime',
    ];

    public function projectManager() { return $this->belongsTo(User::class, 'project_manager_id'); }
    public function siteEngineer()   { return $this->belongsTo(User::class, 'site_engineer_id'); }
    public function contracts()      { return $this->hasMany(\App\Modules\Contract\Models\Contract::class); }
    public function attachments()    { return $this->hasMany(\App\Models\Attachment::class, 'reference_id')->where('module', 'project'); }

    public function getDurationDaysAttribute(): int
    {
        return $this->start_date->diffInDays($this->end_date);
    }

    public function getIsOverdueAttribute(): bool
    {
        return $this->status === 'running' && $this->end_date->isPast();
    }
}
