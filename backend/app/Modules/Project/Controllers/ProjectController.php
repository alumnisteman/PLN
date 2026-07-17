<?php

namespace App\Modules\Project\Controllers;

use App\Http\Controllers\ApiController;
use App\Modules\Project\Models\Project;
use App\Modules\Project\Requests\ProjectRequest;
use App\Modules\Project\Resources\ProjectResource;
use App\Modules\Project\Resources\ProjectCollection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProjectController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $projects = Project::query()
            ->with(['projectManager:id,uuid,name,avatar', 'siteEngineer:id,uuid,name'])
            ->when($request->search, fn($q, $s) => $q->where(function($q) use ($s) {
                $q->where('name', 'like', "%$s%")
                  ->orWhere('code', 'like', "%$s%")
                  ->orWhere('client_name', 'like', "%$s%");
            }))
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->type, fn($q, $t) => $q->where('type', $t))
            ->orderBy($request->sort_by ?? 'created_at', $request->sort_dir ?? 'desc')
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'message' => 'Berhasil',
            'data'    => ProjectResource::collection($projects->items()),
            'meta'    => [
                'current_page' => $projects->currentPage(),
                'last_page'    => $projects->lastPage(),
                'per_page'     => $projects->perPage(),
                'total'        => $projects->total(),
            ],
        ]);
    }

    public function store(ProjectRequest $request): JsonResponse
    {
        $project = Project::create($request->validated());
        return $this->created(new ProjectResource($project), 'Project berhasil dibuat');
    }

    public function show(Project $project): JsonResponse
    {
        $project->load(['projectManager:id,uuid,name,avatar', 'siteEngineer:id,uuid,name', 'contracts']);
        return $this->resource(new ProjectResource($project));
    }

    public function update(ProjectRequest $request, Project $project): JsonResponse
    {
        $project->update($request->validated());
        return $this->resource(new ProjectResource($project->fresh()), 'Project berhasil diperbarui');
    }

    public function destroy(Project $project): JsonResponse
    {
        $project->delete();
        return $this->success(null, 'Project berhasil dihapus');
    }
}
