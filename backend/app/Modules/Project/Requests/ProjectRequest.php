<?php

namespace App\Modules\Project\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ProjectRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'code'               => ['required', 'string', 'max:50', 'unique:projects,code,' . optional($this->project)->id],
            'name'               => ['required', 'string', 'max:255'],
            'description'        => ['nullable', 'string'],
            'client_name'        => ['required', 'string', 'max:255'],
            'client_contact'     => ['nullable', 'string', 'max:255'],
            'location'           => ['required', 'string', 'max:255'],
            'province'           => ['nullable', 'string', 'max:100'],
            'city'               => ['nullable', 'string', 'max:100'],
            'type'               => ['nullable', 'string', 'max:100'],
            'status'             => ['required', 'in:draft,planning,running,hold,completed,closed'],
            'contract_value'     => ['required', 'numeric', 'min:0'],
            'boq_value'          => ['nullable', 'numeric', 'min:0'],
            'start_date'         => ['required', 'date'],
            'end_date'           => ['required', 'date', 'after_or_equal:start_date'],
            'project_manager_id' => ['nullable', 'exists:users,id'],
            'site_engineer_id'   => ['nullable', 'exists:users,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'code.unique'               => 'Kode project sudah digunakan.',
            'end_date.after_or_equal'   => 'Tanggal selesai harus setelah atau sama dengan tanggal mulai.',
            'contract_value.required'   => 'Nilai kontrak wajib diisi.',
        ];
    }
}
