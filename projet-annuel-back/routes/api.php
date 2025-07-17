<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProjectController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\MemberController;

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

// Routes des membres
Route::post('projects/{project}/members', [MemberController::class, 'store']);
Route::delete('projects/{project}/members/{member}', [MemberController::class, 'destroy']); 