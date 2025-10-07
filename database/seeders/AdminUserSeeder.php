<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Verifica se já existe um admin
        if (User::where('is_admin', true)->exists()) {
            $this->command->info('Admin user already exists. Skipping...');
            return;
        }

        // Cria usuário admin padrão
        $admin = User::create([
            'name' => 'Admin UTFPets',
            'email' => 'admin@utfpets.com',
            'password' => Hash::make('admin123'),
            'timezone' => 'America/Sao_Paulo',
            'is_admin' => true,
        ]);

        $this->command->info('Admin user created successfully!');
        $this->command->info('Email: admin@utfpets.com');
        $this->command->info('Password: admin123');
        $this->command->warn('⚠️  IMPORTANT: Change the admin password in production!');
    }
}

