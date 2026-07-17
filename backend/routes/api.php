<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Smart Construction ERP — API Routes v1
|--------------------------------------------------------------------------
*/

// Health Check
Route::get('/health', fn () => response()->json([
    'status'  => 'ok',
    'app'     => config('app.name'),
    'version' => 'v1',
    'time'    => now()->toIso8601String(),
]));

Route::prefix('v1')->name('v1.')->group(function () {

    // ─── Public Auth ───────────────────────────────────────────────────────
    Route::prefix('auth')->name('auth.')->group(function () {
        Route::post('login',  [\App\Modules\Auth\Controllers\AuthController::class, 'login'])->name('login');
    });

    // ─── Protected ─────────────────────────────────────────────────────────
    Route::middleware(['auth:sanctum'])->group(function () {

        // Auth
        Route::prefix('auth')->name('auth.')->group(function () {
            Route::post('logout', [\App\Modules\Auth\Controllers\AuthController::class, 'logout'])->name('logout');
            Route::get('me',      [\App\Modules\Auth\Controllers\AuthController::class, 'me'])->name('me');
        });

        // Dashboard
        Route::get('dashboard',         [\App\Modules\Dashboard\Controllers\DashboardController::class, 'index']);
        Route::get('dashboard/widgets', [\App\Modules\Dashboard\Controllers\DashboardController::class, 'widgets']);

        // Project
        Route::apiResource('projects', \App\Modules\Project\Controllers\ProjectController::class);

        // Contract
        Route::apiResource('contracts', \App\Modules\Contract\Controllers\ContractController::class);

        // Master Data
        Route::prefix('master')->name('master.')->group(function () {
            $types = ['positions', 'departments', 'material-categories', 'units'];
            foreach ($types as $type) {
                Route::get("{$type}",                [\App\Modules\Master\Controllers\MasterController::class, 'index'])->name("{$type}.index");
                Route::get("{$type}/all",            [\App\Modules\Master\Controllers\MasterController::class, 'all'])->name("{$type}.all");
                Route::get("{$type}/{uuid}",         [\App\Modules\Master\Controllers\MasterController::class, 'show'])->name("{$type}.show");
                Route::post("{$type}",               [\App\Modules\Master\Controllers\MasterController::class, 'store'])->name("{$type}.store");
                Route::patch("{$type}/{uuid}",       [\App\Modules\Master\Controllers\MasterController::class, 'update'])->name("{$type}.update");
                Route::delete("{$type}/{uuid}",      [\App\Modules\Master\Controllers\MasterController::class, 'destroy'])->name("{$type}.destroy");
            }
        });

    });

});
