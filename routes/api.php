<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\ProjectMemberController;
use App\Http\Controllers\ColumnController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// Routes des projets protégées par auth:sanctum
Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('projects', ProjectController::class);
    Route::get('projects/{project}/columns', [ProjectController::class, 'columns']);
    Route::get('projects/{project}/tasks', [ProjectController::class, 'tasks']);
    Route::get('projects/{project}/ical', [ProjectController::class, 'exportICal']);
    Route::get('projects/{project}/stats', [ProjectController::class, 'stats']);
    // Routes pour la gestion des membres de projet
    Route::get('/projects/{project}/members', [ProjectMemberController::class, 'index']);
    Route::post('/projects/{project}/invite', [ProjectMemberController::class, 'invite']);
    Route::delete('/projects/{project}/members/{user}', [ProjectMemberController::class, 'remove']);
    // Route pour mettre à jour l'ordre des colonnes
    Route::post('/projects/{project}/columns/reorder', [App\Http\Controllers\ColumnController::class, 'reorder']);
});

// Routes des tâches d'un projet
Route::get('projects/{project}/tasks', [ProjectController::class, 'tasks']);

// Routes des tâches
Route::apiResource('tasks', TaskController::class);

// Route pour déplacer une tâche vers une autre colonne
Route::patch('tasks/{task}/move', [TaskController::class, 'move']);

// Routes des colonnes
Route::apiResource('columns', ColumnController::class);

Route::get('labels', function () {
    return \App\Models\Label::all()->map(function($label) {
        return [
            'id' => $label->id,
            'name' => $label->name,
            'color' => \App\Models\Label::colorFor($label->name),
        ];
    });
}); 