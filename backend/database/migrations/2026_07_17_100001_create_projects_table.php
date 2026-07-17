<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('code', 50)->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('client_name');
            $table->string('client_contact')->nullable();
            $table->string('location');
            $table->string('province')->nullable();
            $table->string('city')->nullable();
            $table->string('type')->nullable();
            $table->enum('status', ['draft','planning','running','hold','completed','closed'])->default('draft');
            $table->decimal('contract_value', 18, 2)->default(0);
            $table->decimal('boq_value', 18, 2)->default(0);
            $table->date('start_date');
            $table->date('end_date');
            $table->decimal('progress_percent', 5, 2)->default(0);
            $table->unsignedBigInteger('project_manager_id')->nullable();
            $table->unsignedBigInteger('site_engineer_id')->nullable();
            $table->json('members')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('project_manager_id')->references('id')->on('users')->nullOnDelete();
            $table->foreign('site_engineer_id')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void { Schema::dropIfExists('projects'); }
};
