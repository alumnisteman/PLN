<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Attachment extends Model
{
    public $timestamps = false;
    protected $table = 'attachments';

    protected $fillable = [
        'uuid', 'module', 'reference_id', 'file_name', 'original_name',
        'extension', 'mime_type', 'size', 'path', 'disk', 'thumbnail_path', 'uploaded_by',
    ];

    protected static function boot(): void
    {
        parent::boot();
        static::creating(fn($m) => $m->uuid = $m->uuid ?? (string) Str::uuid());
    }

    public function uploader() { return $this->belongsTo(User::class, 'uploaded_by'); }

    public function getUrlAttribute(): string
    {
        return asset('storage/' . $this->path);
    }
}
