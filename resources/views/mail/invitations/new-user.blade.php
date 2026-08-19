<x-mail::message>
Olá!

**{{ $inviterName }}** convidou você para o ambiente **{{ $workspaceName }}**.

Crie sua conta para aceitar o convite e começar a usar o {{ config('app.name') }}.

<x-mail::button :url="$url">
Criar minha conta
</x-mail::button>

Se você não esperava este convite, pode ignorar este e-mail.

Até mais,<br>
{{ config('app.name') }}
</x-mail::message>
