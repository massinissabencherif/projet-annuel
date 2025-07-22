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

// Routes temporairement sans authentification pour tester
// Routes des projets
Route::apiResource('projects', ProjectController::class);

// Routes des colonnes d'un projet
Route::get('projects/{project}/columns', [ProjectController::class, 'columns']);

// Routes des tâches d'un projet
Route::get('projects/{project}/tasks', [ProjectController::class, 'tasks']);

// Routes des tâches
Route::apiResource('tasks', TaskController::class);

// Route pour déplacer une tâche vers une autre colonne
Route::patch('tasks/{task}/move', [TaskController::class, 'move']);

// Routes pour la gestion des membres de projet
Route::get('/projects/{project}/members', [ProjectMemberController::class, 'index']);
Route::post('/projects/{project}/invite', [ProjectMemberController::class, 'invite']);
Route::delete('/projects/{project}/members/{user}', [ProjectMemberController::class, 'remove']);

// Routes des colonnes
Route::apiResource('columns', ColumnController::class);
// Route pour mettre à jour l'ordre des colonnes
Route::post('/projects/{project}/columns/reorder', [App\Http\Controllers\ColumnController::class, 'reorder']);

Route::get('labels', function () {
    return \App\Models\Label::all()->map(function($label) {
        return [
            'id' => $label->id,
            'name' => $label->name,
            'color' => \App\Models\Label::colorFor($label->name),
        ];
    });
}); 