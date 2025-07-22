<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Project extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'creator_id', 'is_seeded'];

    protected static function boot()
    {
        parent::boot();

        // static::created(function ($project) {
        //     // Créer les colonnes par défaut pour le projet
        //     $defaultColumns = [
        //         ['name' => 'À faire', 'is_terminal' => false, 'order' => 1],
        //         ['name' => 'En cours', 'is_terminal' => false, 'order' => 2],
        //         ['name' => 'Terminé', 'is_terminal' => true, 'order' => 3],
        //         ['name' => 'Annulé', 'is_terminal' => false, 'order' => 4],
        //     ];
        //
        //     foreach ($defaultColumns as $columnData) {
        //         $project->columns()->create($columnData);
        //     }
        // });
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function columns()
    {
        return $this->hasMany(Column::class);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'project_user');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'project_user');
    }
}
 