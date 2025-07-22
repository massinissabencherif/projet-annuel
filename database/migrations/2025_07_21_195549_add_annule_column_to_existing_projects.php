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
        // Pour chaque projet, ajouter la colonne Annulé si elle n'existe pas déjà
        foreach (Project::all() as $project) {
            $hasAnnule = $project->columns()->where('name', 'Annulé')->exists();
            if (!$hasAnnule) {
                // Calculer le prochain ordre
                $maxOrder = $project->columns()->max('order') ?? 0;
                $project->columns()->create([
                    'name' => 'Annulé',
                    'is_terminal' => false,
                    'order' => $maxOrder + 1,
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Supprimer toutes les colonnes Annulé ajoutées
        Column::where('name', 'Annulé')->delete();
    }
}; 