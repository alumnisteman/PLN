<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

/**
 * Base Model — semua model ERP extends class ini.
 *
 * Fitur standar:
 * - UUID sebagai identitas publik (selain integer PK)
 * - created_by, updated_by, deleted_by untuk audit
 * - SoftDeletes
 * - Auto-set UUID saat creating
 * - Auto-set created_by / updated_by dari auth user
 */
abstract class BaseModel extends Model
{
    use SoftDeletes;

    /**
     * Field standar yang TIDAK boleh diisi via mass assignment.
     * Override $fillable di setiap model untuk field yang diizinkan.
     */
    protected $guarded = [
        'id',
        'uuid',
        'created_by',
        'updated_by',
        'deleted_by',
        'created_at',
        'updated_at',
        'deleted_at',
    ];

    /**
     * Cast standar untuk semua model.
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Hidden by default untuk respons API — expose via Resources.
     */
    protected $hidden = [
        'id',       // Gunakan uuid untuk URL publik
        'deleted_at',
        'deleted_by',
    ];

    protected static function boot(): void
    {
        parent::boot();

        // Auto-generate UUID
        static::creating(function (self $model) {
            if (empty($model->uuid)) {
                $model->uuid = (string) Str::uuid();
            }

            if (auth()->check()) {
                $model->created_by = auth()->id();
                $model->updated_by = auth()->id();
            }
        });

        // Auto-set updated_by
        static::updating(function (self $model) {
            if (auth()->check()) {
                $model->updated_by = auth()->id();
            }
        });

        // Auto-set deleted_by
        static::deleting(function (self $model) {
            if (auth()->check() && method_exists($model, 'runSoftDelete')) {
                $model->deleted_by = auth()->id();
                $model->saveQuietly();
            }
        });
    }

    /**
     * Resolve route model binding menggunakan UUID (bukan ID).
     */
    public function resolveRouteBinding($value, $field = null): ?self
    {
        return $this->where('uuid', $value)->firstOrFail();
    }

    /**
     * Scope: filter berdasarkan created_by.
     */
    public function scopeCreatedBy($query, int $userId)
    {
        return $query->where('created_by', $userId);
    }

    /**
     * Relasi ke user yang membuat record ini.
     */
    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    /**
     * Relasi ke user yang terakhir mengupdate record ini.
     */
    public function updater()
    {
        return $this->belongsTo(\App\Models\User::class, 'updated_by');
    }
}
