<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('number', 100)->unique();
            $table->string('title');
            $table->unsignedBigInteger('project_id');
            $table->enum('type', ['main','addendum','subcontract','supply'])->default('main');
            $table->enum('status', ['draft','active','completed','terminated'])->default('draft');
            $table->decimal('value', 18, 2)->default(0);
            $table->string('client_name')->nullable();
            $table->date('signed_date')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->text('scope')->nullable();
            $table->text('notes')->nullable();
            $table->unsignedBigInteger('created_by')->nullable();
            $table->unsignedBigInteger('updated_by')->nullable();
            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('project_id')->references('id')->on('projects')->cascadeOnDelete();
        });
    }

    public function down(): void { Schema::dropIfExists('contracts'); }
};
