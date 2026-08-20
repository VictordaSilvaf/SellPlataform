import { Form, Head } from '@inertiajs/react';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { useState } from 'react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '@/components/ui/input-otp';
import { Spinner } from '@/components/ui/spinner';
import { OTP_MAX_LENGTH } from '@/hooks/use-two-factor-auth';
import { send, verifyCode } from '@/routes/verification';
import { logout } from '@/routes';

export default function VerifyEmail({ status }: { status?: string }) {
    const [code, setCode] = useState('');

    return (
        <>
            <Head title="Verificação de e-mail" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    Um novo código de verificação foi enviado para o e-mail
                    informado no cadastro.
                </div>
            )}

            <div className="space-y-6">
                <Form
                    {...verifyCode.form()}
                    className="space-y-4"
                    resetOnError
                    resetOnSuccess
                >
                    {({ errors, processing, clearErrors }) => (
                        <div className="flex flex-col items-center justify-center space-y-3 text-center">
                            <input type="hidden" name="code" value={code} />
                            <div className="flex w-full items-center justify-center">
                                <InputOTP
                                    maxLength={OTP_MAX_LENGTH}
                                    value={code}
                                    onChange={(value) => {
                                        setCode(value);
                                        clearErrors();
                                    }}
                                    disabled={processing}
                                    pattern={REGEXP_ONLY_DIGITS}
                                    autoFocus
                                >
                                    <InputOTPGroup>
                                        {Array.from(
                                            { length: OTP_MAX_LENGTH },
                                            (_, index) => (
                                                <InputOTPSlot
                                                    key={index}
                                                    index={index}
                                                />
                                            ),
                                        )}
                                    </InputOTPGroup>
                                </InputOTP>
                            </div>
                            <InputError message={errors.code} />
                            <Button
                                type="submit"
                                disabled={
                                    processing || code.length < OTP_MAX_LENGTH
                                }
                                className="w-full"
                            >
                                {processing && <Spinner />}
                                Confirmar e-mail
                            </Button>
                        </div>
                    )}
                </Form>

                <Form {...send.form()} className="space-y-6 text-center">
                    {({ processing }) => (
                        <>
                            <Button disabled={processing} variant="secondary">
                                {processing && <Spinner />}
                                Reenviar código
                            </Button>

                            <TextLink
                                href={logout()}
                                className="mx-auto block text-sm"
                            >
                                Sair
                            </TextLink>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

VerifyEmail.layout = {
    title: 'Verificação de e-mail',
    description:
        'Digite o código de 6 dígitos que enviamos para o seu e-mail.',
};
