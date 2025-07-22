<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use App\Models\Project;
use App\Models\Column;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Récupérer tous les projets qui n'ont pas de colonnes
        $projectsWithoutColumns = Project::whereDoesntHave('columns')->get();
        
        foreach ($projectsWithoutColumns as $project) {
            // Créer les colonnes par défaut pour chaque projet
            $defaultColumns = [
                ['name' => 'À faire', 'is_terminal' => false],
                ['name' => 'En cours', 'is_terminal' => false],
                ['name' => 'Terminé', 'is_terminal' => true],
            ];

            foreach ($defaultColumns as $columnData) {
                $project->columns()->create($columnData);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Supprimer les colonnes par défaut créées par cette migration
        Column::whereIn('name', ['À faire', 'En cours', 'Terminé'])->delete();
    }
};
