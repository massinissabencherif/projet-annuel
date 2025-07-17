<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\ColumnController;
use App\Http\Middleware\ProjectAccess;
use App\Http\Middleware\ProjectOwner;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/dashboard', function () {
    return view('dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth'])->group(function () {
    Route::resource('projects', ProjectController::class)->parameters([
        'projects' => 'project',
    ]);
    Route::resource('tasks', TaskController::class)->parameters([
        'tasks' => 'task',
    ]);
    Route::resource('columns', ColumnController::class)->parameters([
        'columns' => 'column',
    ]);
    // Routes membres de projet (seul le créateur)
    Route::middleware([ProjectOwner::class])->group(function () {
        Route::get('projects/{project}/members', [MemberController::class, 'index']);
        Route::post('projects/{project}/members', [MemberController::class, 'store']);
        Route::delete('projects/{project}/members/{user}', [MemberController::class, 'destroy']);
    });
    // Routes personnalisées (seul le créateur)
    Route::middleware([ProjectOwner::class])->group(function () {
        Route::patch('tasks/{task}/move', [TaskController::class, 'move']);
        Route::post('tasks/{task}/assign', [TaskController::class, 'assign']);
    });
});

require __DIR__.'/auth.php';
