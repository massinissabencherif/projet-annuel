<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Task extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id', 
        'column_id', 
        'title', 
        'description', 
        'category', 
        'priority', 
        'due_date', 
        'completed_at'
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($task) {
            if (!$task->project_id && $task->column_id) {
                $column = Column::find($task->column_id);
                if ($column) {
                    $task->project_id = $column->project_id;
                }
            }
        });
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function column()
    {
        return $this->belongsTo(Column::class);
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'task_user');
    }

    public function labels()
    {
        return $this->belongsToMany(Label::class, 'label_task');
    }
}
