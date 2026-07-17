<?php

namespace App\Modules\Master\Controllers;

use App\Http\Controllers\ApiController;
use App\Modules\Master\Models\Department;
use App\Modules\Master\Models\MaterialCategory;
use App\Modules\Master\Models\Position;
use App\Modules\Master\Models\Unit;
use App\Modules\Master\Resources\MasterResource;
use Illuminate\Http\Request;

class MasterController extends ApiController
{
    private const MODELS = [
        'positions'           => Position::class,
        'departments'         => Department::class,
        'material-categories'  => MaterialCategory::class,
        'units'                => Unit::class,
    ];

    private const FILLABLE = [
        'positions'          => ['code', 'name', 'department', 'description', 'is_active'],
        'departments'        => ['code', 'name', 'head_name', 'description', 'is_active'],
        'material-categories' => ['code', 'name', 'parent_code', 'description', 'is_active'],
        'units'               => ['code', 'name', 'symbol', 'description', 'is_active'],
    ];

    private const VALIDATION = [
        'positions' => [
            'code'        => 'required|string|max:50',
            'name'        => 'required|string|max:255',
            'department'  => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ],
        'departments' => [
            'code'        => 'required|string|max:50',
            'name'        => 'required|string|max:255',
            'head_name'   => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ],
        'material-categories' => [
            'code'        => 'required|string|max:50',
            'name'        => 'required|string|max:255',
            'parent_code' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ],
        'units' => [
            'code'        => 'required|string|max:20',
            'name'        => 'required|string|max:255',
            'symbol'      => 'required|string|max:10',
            'description' => 'nullable|string',
            'is_active'   => 'boolean',
        ],
    ];

    private function resolveModel(string $type): string
    {
        if (!isset(self::MODELS[$type])) {
            abort(404, 'Tipe master data tidak ditemukan.');
        }
        return self::MODELS[$type];
    }

    public function index(Request $request, string $type)
    {
        $modelClass = $this->resolveModel($type);
        $query = $modelClass::query();

        if ($search = $request->get('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('code', 'like', "%{$search}%")
                  ->orWhere('name', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_active')) {
            $query->where('is_active', filter_var($request->get('is_active'), FILTER_VALIDATE_BOOLEAN));
        }

        $perPage = (int) $request->get('per_page', 15);
        $results = $query->orderBy('code')->paginate($perPage);

        return $this->responseCollection($results);
    }

    public function all(string $type)
    {
        $modelClass = $this->resolveModel($type);
        $results = $modelClass::where('is_active', true)
            ->orderBy('code')
            ->get();

        return $this->success(MasterResource::collection($results));
    }

    public function show(string $type, string $uuid)
    {
        $modelClass = $this->resolveModel($type);
        $record = $modelClass::where('uuid', $uuid)->first();

        if (!$record) {
            return $this->notFound('Data tidak ditemukan.');
        }

        return $this->success(new MasterResource($record));
    }

    public function store(Request $request, string $type)
    {
        $modelClass = $this->resolveModel($type);

        $validated = $request->validate(self::VALIDATION[$type]);
        $validated['is_active'] = $request->boolean('is_active', true);

        $record = $modelClass::create($validated);

        return $this->created(new MasterResource($record), 'Data berhasil dibuat.');
    }

    public function update(Request $request, string $type, string $uuid)
    {
        $modelClass = $this->resolveModel($type);
        $record = $modelClass::where('uuid', $uuid)->first();

        if (!$record) {
            return $this->notFound('Data tidak ditemukan.');
        }

        $rules = self::VALIDATION[$type];
        $rules['code'] = 'required|string|max:50|unique:' . $type . ',code,' . $record->id;

        $validated = $request->validate($rules);
        $record->update($validated);

        return $this->success(new MasterResource($record), 'Data berhasil diperbarui.');
    }

    public function destroy(string $type, string $uuid)
    {
        $modelClass = $this->resolveModel($type);
        $record = $modelClass::where('uuid', $uuid)->first();

        if (!$record) {
            return $this->notFound('Data tidak ditemukan.');
        }

        $record->delete();

        return $this->success(null, 'Data berhasil dihapus.');
    }

    private function responseCollection($paginator)
    {
        return response()->json([
            'success' => true,
            'message' => 'Berhasil',
            'data'    => MasterResource::collection($paginator->items()),
            'meta'    => [
                'current_page' => $paginator->currentPage(),
                'last_page'    => $paginator->lastPage(),
                'per_page'     => $paginator->perPage(),
                'total'        => $paginator->total(),
            ],
        ]);
    }
}
