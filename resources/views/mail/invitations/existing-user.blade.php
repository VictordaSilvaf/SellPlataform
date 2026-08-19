<x-mail::message>
Olá!

**{{ $inviterName }}** convidou você para o ambiente **{{ $workspaceName }}**.

Aceite o convite para registrar vendas e trabalhar no mesmo catálogo da equipe.

<x-mail::button :url="$url">
Abrir convites
</x-mail::button>

Se você não esperava este convite, pode ignorar este e-mail.

Até mais,<br>
{{ config('app.name') }}
</x-mail::message>
