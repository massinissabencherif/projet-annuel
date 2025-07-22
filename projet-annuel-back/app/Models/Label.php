<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Label extends Model
{
    use HasFactory;

    protected $fillable = ['name'];

    public function tasks()
    {
        return $this->belongsToMany(Task::class, 'label_task');
    }

    public static function colorFor($name)
    {
        $colors = [
            'UX' => 'bg-pink-100 text-pink-800',
            'Project Manager' => 'bg-yellow-100 text-yellow-800',
            'Marketing' => 'bg-green-100 text-green-800',
            'Frontend' => 'bg-blue-100 text-blue-800',
            'Backend' => 'bg-purple-100 text-purple-800',
            'Ready for Test' => 'bg-orange-100 text-orange-800',
            'Pending' => 'bg-gray-100 text-gray-800',
        ];
        return $colors[$name] ?? 'bg-gray-100 text-gray-800';
    }
} 