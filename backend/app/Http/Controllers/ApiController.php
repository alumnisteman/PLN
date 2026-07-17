<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Resources\Json\ResourceCollection;

/**
 * Base API Controller.
 *
 * Menyediakan helper untuk respons JSON yang konsisten di seluruh API.
 * Semua controller ERP extends class ini.
 */
abstract class ApiController extends Controller
{
    /**
     * Respons sukses standar.
     */
    protected function success(
        mixed $data = null,
        string $message = 'Berhasil',
        int $status = 200
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], $status);
    }

    /**
     * Respons sukses untuk resource tunggal.
     */
    protected function resource(
        JsonResource $resource,
        string $message = 'Berhasil',
        int $status = 200
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $resource,
        ], $status);
    }

    /**
     * Respons sukses untuk resource collection (dengan pagination).
     */
    protected function collection(
        ResourceCollection $collection,
        string $message = 'Berhasil'
    ): JsonResponse {
        return response()->json(array_merge(
            ['success' => true, 'message' => $message],
            $collection->response()->getData(true)
        ));
    }

    /**
     * Respons saat berhasil membuat data baru.
     */
    protected function created(
        mixed $data = null,
        string $message = 'Data berhasil dibuat'
    ): JsonResponse {
        return $this->success($data, $message, 201);
    }

    /**
     * Respons error validasi.
     */
    protected function validationError(
        array $errors,
        string $message = 'Validasi gagal'
    ): JsonResponse {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors'  => $errors,
        ], 422);
    }

    /**
     * Respons error umum.
     */
    protected function error(
        string $message = 'Terjadi kesalahan',
        int $status = 500,
        mixed $data = null
    ): JsonResponse {
        return response()->json([
            'success' => false,
            'message' => $message,
            'data'    => $data,
        ], $status);
    }

    /**
     * Respons 404.
     */
    protected function notFound(string $message = 'Data tidak ditemukan'): JsonResponse
    {
        return $this->error($message, 404);
    }

    /**
     * Respons 403.
     */
    protected function forbidden(string $message = 'Akses ditolak'): JsonResponse
    {
        return $this->error($message, 403);
    }
}
