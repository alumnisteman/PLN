<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Smart Construction ERP — API Routes
|--------------------------------------------------------------------------
|
| Semua route API menggunakan versioning /api/v1/
| Autentikasi menggunakan Laravel Sanctum
|
*/

// ─── Health Check ──────────────────────────────────────────────────────────
Route::get('/health', fn () => response()->json([
    'status'  => 'ok',
    'app'     => config('app.name'),
    'version' => 'v1',
    'time'    => now()->toIso8601String(),
]));

// ─── API v1 ────────────────────────────────────────────────────────────────
Route::prefix('v1')->name('v1.')->group(function () {

    // ─── Auth (public) ─────────────────────────────────────────────────────
    Route::prefix('auth')->name('auth.')->group(function () {
        Route::post('login',          [\App\Modules\Auth\Controllers\AuthController::class, 'login'])->name('login');
        Route::post('forgot-password',[\App\Modules\Auth\Controllers\AuthController::class, 'forgotPassword'])->name('forgot-password');
        Route::post('reset-password', [\App\Modules\Auth\Controllers\AuthController::class, 'resetPassword'])->name('reset-password');
    });

    // ─── Protected Routes ──────────────────────────────────────────────────
    Route::middleware(['auth:sanctum'])->group(function () {

        // Auth
        Route::prefix('auth')->name('auth.')->group(function () {
            Route::post('logout', [\App\Modules\Auth\Controllers\AuthController::class, 'logout'])->name('logout');
            Route::get('me',      [\App\Modules\Auth\Controllers\AuthController::class, 'me'])->name('me');
        });

        // Dashboard
        Route::prefix('dashboard')->name('dashboard.')->group(function () {
            Route::get('/',       [\App\Modules\Dashboard\Controllers\DashboardController::class, 'index'])->name('index');
            Route::get('widgets', [\App\Modules\Dashboard\Controllers\DashboardController::class, 'widgets'])->name('widgets');
        });

        // Project
        Route::apiResource('projects', \App\Modules\Project\Controllers\ProjectController::class);
        Route::apiResource('projects.milestones', \App\Modules\Project\Controllers\MilestoneController::class)
            ->shallow();

        // Contract
        Route::apiResource('contracts', \App\Modules\Contract\Controllers\ContractController::class);

        // Progress
        Route::apiResource('progress', \App\Modules\Progress\Controllers\ProgressController::class);

        // Material
        Route::apiResource('materials', \App\Modules\Material\Controllers\MaterialController::class);

        // Warehouse
        Route::apiResource('warehouses', \App\Modules\Warehouse\Controllers\WarehouseController::class);
        Route::apiResource('stock-movements', \App\Modules\Warehouse\Controllers\StockMovementController::class);

        // Purchase
        Route::apiResource('purchase-requests', \App\Modules\Purchase\Controllers\PurchaseRequestController::class);
        Route::apiResource('purchase-orders',   \App\Modules\Purchase\Controllers\PurchaseOrderController::class);

        // Vendor
        Route::apiResource('vendors', \App\Modules\Vendor\Controllers\VendorController::class);

        // Finance
        Route::apiResource('invoices',  \App\Modules\Invoice\Controllers\InvoiceController::class);
        Route::apiResource('cashflows', \App\Modules\Finance\Controllers\CashflowController::class);

        // QC
        Route::apiResource('qc-inspections', \App\Modules\QC\Controllers\QcInspectionController::class);

        // HSE
        Route::apiResource('safety-talks', \App\Modules\HSE\Controllers\SafetyTalkController::class);
        Route::apiResource('incidents',    \App\Modules\HSE\Controllers\IncidentController::class);

        // Drawing
        Route::apiResource('drawings', \App\Modules\Drawing\Controllers\DrawingController::class);

        // HR
        Route::apiResource('employees', \App\Modules\HumanResource\Controllers\EmployeeController::class);

        // Equipment
        Route::apiResource('equipment', \App\Modules\Equipment\Controllers\EquipmentController::class);

        // Notification
        Route::get('notifications',         [\App\Modules\Notification\Controllers\NotificationController::class, 'index'])->name('notifications.index');
        Route::patch('notifications/{id}/read', [\App\Modules\Notification\Controllers\NotificationController::class, 'markRead'])->name('notifications.read');
        Route::patch('notifications/read-all',  [\App\Modules\Notification\Controllers\NotificationController::class, 'markAllRead'])->name('notifications.read-all');

        // Master Data
        Route::prefix('master')->name('master.')->group(function () {
            Route::apiResource('provinces',          \App\Modules\Master\Controllers\ProvinceController::class)->only(['index', 'show']);
            Route::apiResource('cities',             \App\Modules\Master\Controllers\CityController::class)->only(['index', 'show']);
            Route::apiResource('project-types',      \App\Modules\Master\Controllers\ProjectTypeController::class);
            Route::apiResource('material-categories',\App\Modules\Master\Controllers\MaterialCategoryController::class);
            Route::apiResource('units',              \App\Modules\Master\Controllers\UnitController::class);
            Route::apiResource('positions',          \App\Modules\Master\Controllers\PositionController::class);
            Route::apiResource('document-types',     \App\Modules\Master\Controllers\DocumentTypeController::class);
        });

        // Setting
        Route::prefix('settings')->name('settings.')->group(function () {
            Route::get('/',    [\App\Modules\Setting\Controllers\SettingController::class, 'index'])->name('index');
            Route::patch('/',  [\App\Modules\Setting\Controllers\SettingController::class, 'update'])->name('update');
        });

        // RBAC
        Route::apiResource('roles',       \App\Modules\Auth\Controllers\RoleController::class);
        Route::apiResource('permissions', \App\Modules\Auth\Controllers\PermissionController::class)->only(['index']);
        Route::apiResource('users',       \App\Modules\Auth\Controllers\UserController::class);

        // Report
        Route::prefix('reports')->name('reports.')->group(function () {
            Route::get('project',  [\App\Modules\Report\Controllers\ReportController::class, 'project'])->name('project');
            Route::get('finance',  [\App\Modules\Report\Controllers\ReportController::class, 'finance'])->name('finance');
            Route::get('material', [\App\Modules\Report\Controllers\ReportController::class, 'material'])->name('material');
            Route::get('hse',      [\App\Modules\Report\Controllers\ReportController::class, 'hse'])->name('hse');
        });

    }); // end auth:sanctum

}); // end v1
