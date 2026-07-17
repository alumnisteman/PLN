<?php

namespace App\Services;

use App\Repositories\BaseRepository;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;

/**
 * Base Service — semua service ERP extends class ini.
 *
 * Mengimplementasikan operasi CRUD dasar melalui Repository.
 * Override method yang diperlukan di service turunan.
 */
abstract class BaseService
{
    public function __construct(
        protected readonly BaseRepository $repository
    ) {}

    /**
     * Ambil semua record dengan pagination.
     */
    public function paginate(
        int $perPage = 15,
        array $filters = [],
        string $sortBy = 'created_at',
        string $sortDir = 'desc'
    ): LengthAwarePaginator {
        return $this->repository->paginate($perPage, $filters, $sortBy, $sortDir);
    }

    /**
     * Ambil semua record tanpa pagination.
     */
    public function all(array $filters = []): Collection
    {
        return $this->repository->all($filters);
    }

    /**
     * Cari record berdasarkan UUID.
     */
    public function findByUuid(string $uuid): ?Model
    {
        return $this->repository->findByUuid($uuid);
    }

    /**
     * Buat record baru.
     */
    public function create(array $data): Model
    {
        return $this->repository->create($data);
    }

    /**
     * Update record berdasarkan UUID.
     */
    public function update(string $uuid, array $data): Model
    {
        return $this->repository->update($uuid, $data);
    }

    /**
     * Soft delete record berdasarkan UUID.
     */
    public function delete(string $uuid): bool
    {
        return $this->repository->delete($uuid);
    }

    /**
     * Restore record yang di-soft-delete.
     */
    public function restore(string $uuid): bool
    {
        return $this->repository->restore($uuid);
    }
}
