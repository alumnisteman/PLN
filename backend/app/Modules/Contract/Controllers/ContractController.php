<?php

namespace App\Modules\Contract\Controllers;

use App\Http\Controllers\ApiController;
use App\Modules\Contract\Models\Contract;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContractController extends ApiController
{
    public function index(Request $request): JsonResponse
    {
        $contracts = Contract::query()
            ->with('project:id,uuid,code,name')
            ->when($request->project_id, fn($q, $id) => $q->where('project_id', $id))
            ->when($request->status, fn($q, $s) => $q->where('status', $s))
            ->when($request->search, fn($q, $s) => $q->where(function($q) use ($s) {
                $q->where('title', 'like', "%$s%")->orWhere('number', 'like', "%$s%");
            }))
            ->orderByDesc('created_at')
            ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'message' => 'Berhasil',
            'data'    => $contracts->items(),
            'meta'    => [
                'current_page' => $contracts->currentPage(),
                'last_page'    => $contracts->lastPage(),
                'per_page'     => $contracts->perPage(),
                'total'        => $contracts->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'number'     => 'required|string|unique:contracts,number',
            'title'      => 'required|string',
            'project_id' => 'required|exists:projects,id',
            'type'       => 'required|in:main,addendum,subcontract,supply',
            'status'     => 'required|in:draft,active,completed,terminated',
            'value'      => 'required|numeric|min:0',
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
        ]);
        $contract = Contract::create($validated);
        return $this->created($contract, 'Kontrak berhasil dibuat');
    }

    public function show(Contract $contract): JsonResponse
    {
        $contract->load('project:id,uuid,code,name');
        return $this->success($contract);
    }

    public function update(Request $request, Contract $contract): JsonResponse
    {
        $contract->update($request->except(['number', 'project_id']));
        return $this->success($contract->fresh(), 'Kontrak berhasil diperbarui');
    }

    public function destroy(Contract $contract): JsonResponse
    {
        $contract->delete();
        return $this->success(null, 'Kontrak berhasil dihapus');
    }
}
