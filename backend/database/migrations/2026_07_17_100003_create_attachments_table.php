<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('attachments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('module', 50);
            $table->unsignedBigInteger('reference_id');
            $table->string('file_name');
            $table->string('original_name');
            $table->string('extension', 20);
            $table->string('mime_type', 100);
            $table->unsignedBigInteger('size')->default(0);
            $table->string('path');
            $table->string('disk', 20)->default('local');
            $table->string('thumbnail_path')->nullable();
            $table->unsignedBigInteger('uploaded_by')->nullable();
            $table->timestamps();

            $table->index(['module', 'reference_id']);
            $table->foreign('uploaded_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void { Schema::dropIfExists('attachments'); }
};
