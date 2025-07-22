<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
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
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'nullable|string|max:100',
            'priority' => 'sometimes|required|string|in:low,medium,high',
            'due_date' => 'nullable|date',
            'completed_at' => 'nullable|date',
            'column_id' => 'sometimes|required|exists:columns,id',
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
            'title.required' => 'Le titre de la tâche est requis.',
            'title.max' => 'Le titre ne peut pas dépasser 255 caractères.',
            'category.max' => 'La catégorie ne peut pas dépasser 100 caractères.',
            'priority.required' => 'La priorité est requise.',
            'priority.in' => 'La priorité doit être low, medium ou high.',
            'due_date.after_or_equal' => 'La date d\'échéance doit être aujourd\'hui ou dans le futur.',
            'column_id.exists' => 'La colonne sélectionnée n\'existe pas.',
            'user_ids.*.exists' => 'Un des utilisateurs sélectionnés n\'existe pas.',
            'label_ids.*.exists' => 'Un des labels sélectionnés n\'existe pas.',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $userIds = $this->input('user_ids', []);
            $task = $this->route('task');
            if ($task && !empty($userIds)) {
                $project = $task->project;
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
