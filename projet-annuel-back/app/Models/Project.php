<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Project extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description', 'creator_id'];

    protected static function boot()
    {
        parent::boot();

        static::created(function ($project) {
            // Créer les colonnes par défaut pour le projet
            $defaultColumns = [
                ['name' => 'À faire', 'is_terminal' => false],
                ['name' => 'En cours', 'is_terminal' => false],
                ['name' => 'Terminé', 'is_terminal' => true],
            ];

            foreach ($defaultColumns as $columnData) {
                $project->columns()->create($columnData);
            }
        });
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
}
