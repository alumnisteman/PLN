<?php

namespace App\Repositories;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

/**
 * Base Repository — semua repository ERP extends class ini.
 *
 * Menyediakan operasi data standar untuk semua modul.
 * Repository bertanggung jawab untuk query database saja —
 * business logic ada di Service layer.
 */
abstract class BaseRepository
{
    public function __construct(
        protected readonly Model $model
    ) {}

    /**
     * Paginate dengan filter dan sorting.
     *
     * @param array $filters Key-value untuk where clause
     */
    public function paginate(
        int $perPage = 15,
        array $filters = [],
        string $sortBy = 'created_at',
        string $sortDir = 'desc'
    ): LengthAwarePaginator {
        $query = $this->model->newQuery();

        foreach ($filters as $field => $value) {
            if ($value !== null && $value !== '') {
                if (is_array($value)) {
                    $query->whereIn($field, $value);
                } else {
                    $query->where($field, $value);
                }
            }
        }

        return $query
            ->orderBy($sortBy, $sortDir)
            ->paginate($perPage)
            ->withQueryString();
    }

    /**
     * Ambil semua record.
     */
    public function all(array $filters = []): Collection
    {
        $query = $this->model->newQuery();

        foreach ($filters as $field => $value) {
            if ($value !== null && $value !== '') {
                $query->where($field, $value);
            }
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Cari berdasarkan UUID.
     */
    public function findByUuid(string $uuid): ?Model
    {
        return $this->model->where('uuid', $uuid)->firstOrFail();
    }

    /**
     * Cari berdasarkan ID.
     */
    public function findById(int $id): ?Model
    {
        return $this->model->findOrFail($id);
    }

    /**
     * Buat record baru.
     */
    public function create(array $data): Model
    {
        return $this->model->create($data);
    }

    /**
     * Update record berdasarkan UUID.
     */
    public function update(string $uuid, array $data): Model
    {
        $record = $this->findByUuid($uuid);
        $record->update($data);
        return $record->fresh();
    }

    /**
     * Soft delete berdasarkan UUID.
     */
    public function delete(string $uuid): bool
    {
        $record = $this->findByUuid($uuid);
        return $record->delete();
    }

    /**
     * Restore soft-deleted record.
     */
    public function restore(string $uuid): bool
    {
        $record = $this->model
            ->withTrashed()
            ->where('uuid', $uuid)
            ->firstOrFail();
        return $record->restore();
    }
}
