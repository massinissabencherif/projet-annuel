<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTaskRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'project_id' => 'required|exists:projects,id',
            'column_id' => 'required|exists:columns,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'priority' => 'required|string|in:low,medium,high',
            'due_date' => 'nullable|date',
            'completed_at' => 'nullable|date',
            'user_ids' => 'array',
            'user_ids.*' => 'exists:users,id',
            'label_ids' => 'array',
            'label_ids.*' => 'exists:labels,id',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'project_id.required' => 'Le projet est requis.',
            'project_id.exists' => 'Le projet sélectionné n\'existe pas.',
            'column_id.required' => 'La colonne est requise.',
            'column_id.exists' => 'La colonne sélectionnée n\'existe pas.',
            'title.required' => 'Le titre de la tâche est requis.',
            'title.max' => 'Le titre ne peut pas dépasser 255 caractères.',
            'category.max' => 'La catégorie ne peut pas dépasser 100 caractères.',
            'priority.required' => 'La priorité est requise.',
            'priority.in' => 'La priorité doit être low, medium ou high.',
            'due_date.after_or_equal' => 'La date d\'échéance doit être aujourd\'hui ou dans le futur.',
            'user_ids.*.exists' => 'Un des utilisateurs sélectionnés n\'existe pas.',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $userIds = $this->input('user_ids', []);
            $projectId = $this->input('project_id');
            if ($projectId && !empty($userIds)) {
                $project = \App\Models\Project::find($projectId);
                if ($project) {
                    $memberIds = $project->members()->pluck('users.id')->toArray();
                    foreach ($userIds as $uid) {
                        if (!in_array($uid, $memberIds)) {
                            $validator->errors()->add('user_ids', 'Un utilisateur assigné n\'est pas membre du projet.');
                        }
                    }
                }
            }
        });
    }
}
