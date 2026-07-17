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

        // Sample contracts
        $prj1 = \App\Modules\Project\Models\Project::where('code', 'PRJ-2026-001')->first();
        $prj2 = \App\Modules\Project\Models\Project::where('code', 'PRJ-2026-002')->first();
        $prj3 = \App\Modules\Project\Models\Project::where('code', 'PRJ-2025-011')->first();

        $contracts = [
            [
                'number'     => 'KTR-2026-001',
                'title'      => 'Kontrak Pelaksanaan Instalasi Jaringan Listrik 20kV',
                'project_id' => $prj1?->id,
                'type'       => 'main',
                'status'     => 'active',
                'value'      => 4800000000,
                'client_name'=> 'PT PLN (Persero) ULP Balikpapan',
                'signed_date'=> '2026-01-10',
                'start_date' => '2026-01-15',
                'end_date'   => '2026-12-31',
                'scope'      => 'Pekerjaan instalasi jaringan listrik 20kV sepanjang 15 km meliputi tiang, kabel, dan accessories.',
                'notes'      => 'Kontrak utama dengan termin pembayaran 4 kali.',
            ],
            [
                'number'     => 'KTR-2026-002',
                'title'      => 'Kontrak Pembangunan Gardu Induk 150/20kV',
                'project_id' => $prj2?->id,
                'type'       => 'main',
                'status'     => 'draft',
                'value'      => 12500000000,
                'client_name'=> 'PT PLN (Persero) UIP Kalimantan',
                'signed_date'=> null,
                'start_date' => '2026-03-01',
                'end_date'   => '2027-06-30',
                'scope'      => 'Pembangunan gardu induk 150/20kV lengkap dengan switchgear dan transformator.',
                'notes'      => 'Menunggu approval dari direksi.',
            ],
            [
                'number'     => 'KTR-2025-011',
                'title'      => 'Kontrak Jaringan SUTT 150kV',
                'project_id' => $prj3?->id,
                'type'       => 'main',
                'status'     => 'completed',
                'value'      => 8900000000,
                'client_name'=> 'PT PLN (Persero) UIW Kalimantan Timur',
                'signed_date'=> '2025-03-28',
                'start_date' => '2025-04-01',
                'end_date'   => '2026-03-31',
                'scope'      => 'Pembangunan jaringan SUTT 150kV sepanjang 25 km.',
                'notes'      => 'Kontrak selesai dengan serah terima 2026-03-31.',
            ],
            [
                'number'     => 'ADD-2026-001',
                'title'      => 'Addendum Kontrak Instalasi Jaringan 20kV',
                'project_id' => $prj1?->id,
                'type'       => 'addendum',
                'status'     => 'active',
                'value'      => 350000000,
                'client_name'=> 'PT PLN (Persero) ULP Balikpapan',
                'signed_date'=> '2026-04-15',
                'start_date' => '2026-04-20',
                'end_date'   => '2026-12-31',
                'scope'      => 'Penambahan scope pekerjaan sepanjang 2 km.',
                'notes'      => 'Addendum untuk perpanjangan jaringan.',
            ],
        ];

        foreach ($contracts as $c) {
            if ($c['project_id']) {
                \App\Modules\Contract\Models\Contract::firstOrCreate(
                    ['number' => $c['number']],
                    $c + ['created_by' => $admin->id]
                );
            }
        }

        // ─── Master Data ───────────────────────────────────────────────────
        $masterAdmin = $admin;

        $departments = [
            ['code' => 'DEPT-ENG', 'name' => 'Engineering',          'head_name' => 'Andi Wijaya',   'description' => 'Tim engineering & perencanaan teknis'],
            ['code' => 'DEPT-OPS', 'name' => 'Operasional',          'head_name' => 'Budi Santoso',  'description' => 'Tim operasional & lapangan'],
            ['code' => 'DEPT-FIN', 'name' => 'Finance',              'head_name' => 'Citra Lestari',  'description' => 'Tim keuangan & administrasi'],
            ['code' => 'DEPT-PRC', 'name' => 'Pengadaan',            'head_name' => 'Dedi Pratama',   'description' => 'Tim pengadaan & vendor'],
            ['code' => 'DEPT-HSE', 'name' => 'HSE',                  'head_name' => 'Eka Putra',      'description' => 'Health, Safety & Environment'],
            ['code' => 'DEPT-QC',  'name' => 'Quality Control',      'head_name' => 'Fajar Nugroho',  'description' => 'Tim quality control & inspeksi'],
        ];
        foreach ($departments as $d) {
            \App\Modules\Master\Models\Department::firstOrCreate(
                ['code' => $d['code']],
                $d + ['created_by' => $masterAdmin->id]
            );
        }

        $positions = [
            ['code' => 'POS-DIR',  'name' => 'Direktur',              'department' => 'Management',    'description' => 'Direktur utama'],
            ['code' => 'POS-PM',   'name' => 'Project Manager',        'department' => 'Engineering',   'description' => 'Manajer proyek'],
            ['code' => 'POS-SE',   'name' => 'Site Engineer',          'department' => 'Engineering',   'description' => 'Insinyur lapangan'],
            ['code' => 'POS-FIN',  'name' => 'Finance Officer',        'department' => 'Finance',       'description' => 'Staf keuangan'],
            ['code' => 'POS-PRC',  'name' => 'Procurement Officer',   'department' => 'Pengadaan',      'description' => 'Staf pengadaan'],
            ['code' => 'POS-HSE',  'name' => 'HSE Officer',           'department' => 'HSE',           'description' => 'Officer K3'],
            ['code' => 'POS-QC',   'name' => 'QC Inspector',          'department' => 'Quality Control','description' => 'Inspector kualitas'],
            ['code' => 'POS-WH',   'name' => 'Warehouse Staff',       'department' => 'Operasional',    'description' => 'Staf gudang'],
        ];
        foreach ($positions as $p) {
            \App\Modules\Master\Models\Position::firstOrCreate(
                ['code' => $p['code']],
                $p + ['created_by' => $masterAdmin->id]
            );
        }

        $materialCategories = [
            ['code' => 'CAT-KBL', 'name' => 'Kabel',                 'parent_code' => null,       'description' => 'Kabel & aksesorisnya'],
            ['code' => 'CAT-TNG', 'name' => 'Tiang',                 'parent_code' => null,       'description' => 'Tiang listrik berbagai jenis'],
            ['code' => 'CAT-TRF', 'name' => 'Transformator',         'parent_code' => null,       'description' => 'Transformator & trafo'],
            ['code' => 'CAT-SWT', 'name' => 'Switchgear',            'parent_code' => null,       'description' => 'Switchgear & panel kontrol'],
            ['code' => 'CAT-ACC', 'name' => 'Accessories',          'parent_code' => null,       'description' => 'Aksesori pendukung'],
            ['code' => 'CAT-KBL-NY', 'name' => 'Kabel NYM',         'parent_code' => 'CAT-KBL',  'description' => 'Kabel NYM untuk instalasi dalam'],
            ['code' => 'CAT-KBL-NYY', 'name' => 'Kabel NYY',        'parent_code' => 'CAT-KBL',  'description' => 'Kabel NYY untuk instalasi luar'],
            ['code' => 'CAT-TNG-BT', 'name' => 'Tang Beton',         'parent_code' => 'CAT-TNG',  'description' => 'Tiang beton'],
            ['code' => 'CAT-TNG-ST', 'name' => 'Tang Baja',          'parent_code' => 'CAT-TNG',  'description' => 'Tiang baja / pipa besi'],
        ];
        foreach ($materialCategories as $c) {
            \App\Modules\Master\Models\MaterialCategory::firstOrCreate(
                ['code' => $c['code']],
                $c + ['created_by' => $masterAdmin->id]
            );
        }

        $units = [
            ['code' => 'UNT-PCS', 'name' => 'Pieces',  'symbol' => 'pcs', 'description' => 'Satuan buah'],
            ['code' => 'UNT-MTR', 'name' => 'Meter',   'symbol' => 'm',   'description' => 'Satuan meter'],
            ['code' => 'UNT-KG',  'name' => 'Kilogram','symbol' => 'kg',  'description' => 'Satuan kilogram'],
            ['code' => 'UNT-SET', 'name' => 'Set',     'symbol' => 'set', 'description' => 'Satuan set lengkap'],
            ['code' => 'UNT-UNT', 'name' => 'Unit',    'symbol' => 'unit','description' => 'Satuan unit'],
            ['code' => 'UNT-ROL', 'name' => 'Roll',    'symbol' => 'roll','description' => 'Satuan roll kabel'],
            ['code' => 'UNT-M3',  'name' => 'Meter Kubik','symbol' => 'm³','description'=> 'Satuan volume'],
            ['code' => 'UNT-LS',  'name' => 'Lump Sum','symbol' => 'ls',  'description' => 'Satuan lump sum'],
        ];
        foreach ($units as $u) {
            \App\Modules\Master\Models\Unit::firstOrCreate(
                ['code' => $u['code']],
                $u + ['created_by' => $masterAdmin->id]
            );
        }

        $this->command->info('✅ Seeder selesai! Akun default:');
        $this->command->info('  admin@erp.local / password');
        $this->command->info('  director@erp.local / password');
        $this->command->info('  pm@erp.local / password');
    }
}
