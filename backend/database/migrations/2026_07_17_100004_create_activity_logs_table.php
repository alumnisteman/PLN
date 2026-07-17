<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('module', 50);
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->string('reference_label')->nullable();
            $table->string('action', 50);
            $table->string('description');
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index(['module', 'reference_id']);
            $table->index('user_id');
            $table->index('created_at');
        });
    }

    public function down(): void { Schema::dropIfExists('activity_logs'); }
};
