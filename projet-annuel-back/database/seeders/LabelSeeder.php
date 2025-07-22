<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Label;

class LabelSeeder extends Seeder
{
    public function run(): void
    {
        $labels = [
            'UX',
            'Project Manager',
            'Marketing',
            'Frontend',
            'Backend',
            'Ready for Test',
            'Pending',
        ];
        foreach ($labels as $label) {
            Label::firstOrCreate(['name' => $label]);
        }
    }
} 