<?php

namespace App\Http\Requests\Auth;

use App\Support\Auth\EmailVerificationCode;
use Illuminate\Foundation\Http\FormRequest;

class VerifyEmailCodeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, list<string>>
     */
    public function rules(): array
    {
        return [
            'code' => [
                'required',
                'string',
                'size:'.EmailVerificationCode::LENGTH,
                'regex:/^\d{'.EmailVerificationCode::LENGTH.'}$/',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'code.required' => 'Informe o código enviado por e-mail.',
            'code.size' => 'O código deve ter '.EmailVerificationCode::LENGTH.' dígitos.',
            'code.regex' => 'O código deve conter apenas números.',
        ];
    }
}
