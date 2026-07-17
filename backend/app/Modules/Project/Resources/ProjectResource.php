<?php

namespace App\Modules\Project\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid'             => $this->uuid,
            'code'             => $this->code,
            'name'             => $this->name,
            'description'      => $this->description,
            'client_name'      => $this->client_name,
            'client_contact'   => $this->client_contact,
            'location'         => $this->location,
            'province'         => $this->province,
            'city'             => $this->city,
            'type'             => $this->type,
            'status'           => $this->status,
            'contract_value'   => (float) $this->contract_value,
            'boq_value'        => (float) $this->boq_value,
            'start_date'       => $this->start_date?->format('Y-m-d'),
            'end_date'         => $this->end_date?->format('Y-m-d'),
            'progress_percent' => (float) $this->progress_percent,
            'duration_days'    => $this->duration_days,
            'is_overdue'       => $this->is_overdue,
            'project_manager'  => $this->whenLoaded('projectManager', fn() => [
                'uuid'   => $this->projectManager->uuid,
                'name'   => $this->projectManager->name,
                'avatar' => $this->projectManager->avatar,
            ]),
            'site_engineer'    => $this->whenLoaded('siteEngineer', fn() => [
                'uuid' => $this->siteEngineer->uuid,
                'name' => $this->siteEngineer->name,
            ]),
            'contracts_count'  => $this->whenLoaded('contracts', fn() => $this->contracts->count()),
            'created_at'       => $this->created_at?->toIso8601String(),
            'updated_at'       => $this->updated_at?->toIso8601String(),
        ];
    }
}
