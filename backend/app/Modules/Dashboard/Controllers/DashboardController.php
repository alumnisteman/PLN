<?php

namespace App\Modules\Dashboard\Controllers;

use App\Http\Controllers\ApiController;
use App\Modules\Project\Models\Project;
use Illuminate\Http\JsonResponse;

class DashboardController extends ApiController
{
    public function index(): JsonResponse
    {
        $stats = [
            'projects' => [
                'total'     => Project::count(),
                'running'   => Project::where('status', 'running')->count(),
                'completed' => Project::where('status', 'completed')->count(),
                'draft'     => Project::whereIn('status', ['draft', 'planning'])->count(),
            ],
            'contracts' => [
                'total'  => \App\Modules\Contract\Models\Contract::count(),
                'active' => \App\Modules\Contract\Models\Contract::where('status', 'active')->count(),
            ],
        ];

        $recentProjects = Project::with('projectManager:id,uuid,name')
            ->orderByDesc('created_at')
            ->limit(5)
            ->get()
            ->map(fn($p) => [
                'uuid'             => $p->uuid,
                'code'             => $p->code,
                'name'             => $p->name,
                'status'           => $p->status,
                'progress_percent' => (float) $p->progress_percent,
                'contract_value'   => (float) $p->contract_value,
                'end_date'         => $p->end_date?->format('Y-m-d'),
                'project_manager'  => $p->projectManager?->name,
            ]);

        return $this->success([
            'stats'           => $stats,
            'recent_projects' => $recentProjects,
        ]);
    }

    public function widgets(): JsonResponse
    {
        return $this->success([
            'available' => [
                ['id' => 'project_stats',    'title' => 'Statistik Project',  'icon' => 'FolderKanban'],
                ['id' => 'recent_projects',  'title' => 'Project Terbaru',    'icon' => 'LayoutList'],
                ['id' => 'contract_stats',   'title' => 'Statistik Kontrak',  'icon' => 'FileText'],
                ['id' => 'activity_feed',    'title' => 'Aktivitas Terbaru',  'icon' => 'Activity'],
            ],
        ]);
    }
}
