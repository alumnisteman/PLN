<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Define all permissions
        $modules = [
            'dashboard', 'project', 'contract', 'progress', 'material',
            'warehouse', 'purchase', 'vendor', 'finance', 'invoice',
            'qc', 'hse', 'drawing', 'equipment', 'hr', 'report',
            'notification', 'setting', 'master', 'user', 'role',
        ];
        $actions = ['view', 'create', 'edit', 'delete', 'approve', 'export'];

        $permissions = [];
        foreach ($modules as $module) {
            foreach ($actions as $action) {
                $perm = Permission::firstOrCreate(['name' => "$module.$action", 'guard_name' => 'web']);
                $permissions["$module.$action"] = $perm;
            }
        }

        // Create roles
        $superAdmin = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => 'web']);

        $director = Role::firstOrCreate(['name' => 'director', 'guard_name' => 'web']);
        $pm       = Role::firstOrCreate(['name' => 'project-manager', 'guard_name' => 'web']);
        $engineer = Role::firstOrCreate(['name' => 'site-engineer', 'guard_name' => 'web']);
        $finance  = Role::firstOrCreate(['name' => 'finance', 'guard_name' => 'web']);
        $warehouse= Role::firstOrCreate(['name' => 'warehouse', 'guard_name' => 'web']);

        // Super admin gets all permissions
        $superAdmin->syncPermissions(Permission::all());

        // Director gets view + approve + export on most modules
        $directorPerms = collect($modules)->flatMap(fn($m) =>
            ["$m.view", "$m.approve", "$m.export"]
        )->filter(fn($p) => isset($permissions[$p]))->toArray();
        $director->syncPermissions($directorPerms);

        // PM gets most things except user/role/setting management
        $pmExclude = ['user', 'role', 'setting'];
        $pmPerms = collect($modules)
            ->filter(fn($m) => !in_array($m, $pmExclude))
            ->flatMap(fn($m) => ["$m.view", "$m.create", "$m.edit", "$m.approve", "$m.export"])
            ->filter(fn($p) => isset($permissions[$p]))->toArray();
        $pm->syncPermissions($pmPerms);

        // Engineer: project operations
        $engModules = ['dashboard', 'project', 'progress', 'material', 'qc', 'hse', 'drawing', 'equipment'];
        $engPerms = collect($engModules)->flatMap(fn($m) =>
            ["$m.view", "$m.create", "$m.edit"]
        )->filter(fn($p) => isset($permissions[$p]))->toArray();
        $engineer->syncPermissions($engPerms);

        // Finance: finance modules
        $finModules = ['dashboard', 'finance', 'invoice', 'contract', 'vendor', 'purchase', 'report'];
        $finPerms = collect($finModules)->flatMap(fn($m) =>
            ["$m.view", "$m.create", "$m.edit", "$m.approve", "$m.export"]
        )->filter(fn($p) => isset($permissions[$p]))->toArray();
        $finance->syncPermissions($finPerms);

        // Create default users
        $admin = User::firstOrCreate(
            ['email' => 'admin@erp.local'],
            [
                'name'     => 'Super Administrator',
                'password' => Hash::make('password'),
                'phone'    => '081234567890',
                'is_active'=> true,
            ]
        );
        $admin->assignRole($superAdmin);

        $dirUser = User::firstOrCreate(
            ['email' => 'director@erp.local'],
            [
                'name'     => 'Budi Santoso',
                'password' => Hash::make('password'),
                'is_active'=> true,
            ]
        );
        $dirUser->assignRole($director);

        $pmUser = User::firstOrCreate(
            ['email' => 'pm@erp.local'],
            [
                'name'     => 'Andi Wijaya',
                'password' => Hash::make('password'),
                'is_active'=> true,
            ]
        );
        $pmUser->assignRole($pm);

        // Sample projects
        $projects = [
            [
                'code'           => 'PRJ-2026-001',
                'name'           => 'Instalasi Jaringan Listrik 20kV Kalimantan Timur',
                'client_name'    => 'PT PLN (Persero) ULP Balikpapan',
                'location'       => 'Balikpapan, Kalimantan Timur',
                'province'       => 'Kalimantan Timur',
                'city'           => 'Balikpapan',
                'type'           => 'Instalasi Jaringan',
                'status'         => 'running',
                'contract_value' => 4800000000,
                'boq_value'      => 4650000000,
                'start_date'     => '2026-01-15',
                'end_date'       => '2026-12-31',
                'progress_percent'=> 38.5,
                'project_manager_id' => $pmUser->id,
            ],
            [
                'code'           => 'PRJ-2026-002',
                'name'           => 'Pembangunan Gardu Induk 150/20kV Samarinda',
                'client_name'    => 'PT PLN (Persero) UIP Kalimantan',
                'location'       => 'Samarinda, Kalimantan Timur',
                'province'       => 'Kalimantan Timur',
                'city'           => 'Samarinda',
                'type'           => 'Gardu Induk',
                'status'         => 'planning',
                'contract_value' => 12500000000,
                'boq_value'      => 12200000000,
                'start_date'     => '2026-03-01',
                'end_date'       => '2027-06-30',
                'progress_percent'=> 0,
                'project_manager_id' => $pmUser->id,
            ],
            [
                'code'           => 'PRJ-2025-011',
                'name'           => 'Jaringan SUTT 150kV Kutai Kartanegara',
                'client_name'    => 'PT PLN (Persero) UIW Kalimantan Timur',
                'location'       => 'Tenggarong, Kutai Kartanegara',
                'province'       => 'Kalimantan Timur',
                'city'           => 'Tenggarong',
                'type'           => 'Transmisi',
                'status'         => 'completed',
                'contract_value' => 8900000000,
                'boq_value'      => 8750000000,
                'start_date'     => '2025-04-01',
                'end_date'       => '2026-03-31',
                'progress_percent'=> 100,
                'project_manager_id' => $pmUser->id,
            ],
            [
                'code'           => 'PRJ-2026-003',
                'name'           => 'Renovasi Jaringan Distribusi 20kV Bontang',
                'client_name'    => 'PT PLN (Persero) ULP Bontang',
                'location'       => 'Bontang, Kalimantan Timur',
                'province'       => 'Kalimantan Timur',
                'city'           => 'Bontang',
                'type'           => 'Distribusi',
                'status'         => 'draft',
                'contract_value' => 2300000000,
                'boq_value'      => 0,
                'start_date'     => '2026-08-01',
                'end_date'       => '2027-01-31',
                'progress_percent'=> 0,
            ],
            [
                'code'           => 'PRJ-2026-004',
                'name'           => 'Pemasangan Street Light LED Kota Berau',
                'client_name'    => 'Dinas PU Kabupaten Berau',
                'location'       => 'Tanjung Redeb, Berau',
                'province'       => 'Kalimantan Timur',
                'city'           => 'Berau',
                'type'           => 'Penerangan Jalan',
                'status'         => 'running',
                'contract_value' => 1750000000,
                'boq_value'      => 1700000000,
                'start_date'     => '2026-02-01',
                'end_date'       => '2026-09-30',
                'progress_percent'=> 62.0,
                'project_manager_id' => $pmUser->id,
            ],
        ];

        foreach ($projects as $data) {
            \App\Modules\Project\Models\Project::firstOrCreate(
                ['code' => $data['code']],
                $data + ['created_by' => $admin->id]
            );
        }

        $this->command->info('✅ Seeder selesai! Akun default:');
        $this->command->info('  admin@erp.local / password');
        $this->command->info('  director@erp.local / password');
        $this->command->info('  pm@erp.local / password');
    }
}
