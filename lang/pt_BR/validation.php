<?php

$lines = require __DIR__.'/../en/validation.php';

$lines['accepted'] = 'O campo :attribute deve ser aceito.';
$lines['active_url'] = 'O campo :attribute deve ser uma URL válida.';
$lines['after'] = 'O campo :attribute deve ser uma data posterior a :date.';
$lines['after_or_equal'] = 'O campo :attribute deve ser uma data posterior ou igual a :date.';
$lines['alpha'] = 'O campo :attribute deve conter somente letras.';
$lines['alpha_dash'] = 'O campo :attribute deve conter somente letras, números, traços e sublinhados.';
$lines['alpha_num'] = 'O campo :attribute deve conter somente letras e números.';
$lines['array'] = 'O campo :attribute deve ser um array.';
$lines['before'] = 'O campo :attribute deve ser uma data anterior a :date.';
$lines['before_or_equal'] = 'O campo :attribute deve ser uma data anterior ou igual a :date.';
$lines['between'] = [
    'array' => 'O campo :attribute deve ter entre :min e :max itens.',
    'file' => 'O campo :attribute deve ter entre :min e :max kilobytes.',
    'numeric' => 'O campo :attribute deve estar entre :min e :max.',
    'string' => 'O campo :attribute deve ter entre :min e :max caracteres.',
];
$lines['boolean'] = 'O campo :attribute deve ser verdadeiro ou falso.';
$lines['confirmed'] = 'A confirmação de :attribute não confere.';
$lines['current_password'] = 'A senha está incorreta.';
$lines['date'] = 'O campo :attribute deve ser uma data válida.';
$lines['email'] = 'O campo :attribute deve ser um endereço de e-mail válido.';
$lines['enum'] = 'O :attribute selecionado é inválido.';
$lines['exists'] = 'O :attribute selecionado é inválido.';
$lines['filled'] = 'O campo :attribute deve ter um valor.';
$lines['in'] = 'O :attribute selecionado é inválido.';
$lines['integer'] = 'O campo :attribute deve ser um número inteiro.';
$lines['max'] = [
    'array' => 'O campo :attribute não deve ter mais que :max itens.',
    'file' => 'O campo :attribute não deve ser maior que :max kilobytes.',
    'numeric' => 'O campo :attribute não deve ser maior que :max.',
    'string' => 'O campo :attribute não deve ter mais que :max caracteres.',
];
$lines['min'] = [
    'array' => 'O campo :attribute deve ter pelo menos :min itens.',
    'file' => 'O campo :attribute deve ter pelo menos :min kilobytes.',
    'numeric' => 'O campo :attribute deve ser no mínimo :min.',
    'string' => 'O campo :attribute deve ter pelo menos :min caracteres.',
];
$lines['numeric'] = 'O campo :attribute deve ser um número.';
$lines['password'] = [
    'letters' => 'O campo :attribute deve conter pelo menos uma letra.',
    'mixed' => 'O campo :attribute deve conter pelo menos uma letra maiúscula e uma minúscula.',
    'numbers' => 'O campo :attribute deve conter pelo menos um número.',
    'symbols' => 'O campo :attribute deve conter pelo menos um símbolo.',
    'uncompromised' => 'O :attribute informado apareceu em um vazamento de dados. Escolha outro :attribute.',
];
$lines['regex'] = 'O formato do campo :attribute é inválido.';
$lines['required'] = 'O campo :attribute é obrigatório.';
$lines['required_with'] = 'O campo :attribute é obrigatório quando :values está presente.';
$lines['same'] = 'Os campos :attribute e :other devem coincidir.';
$lines['string'] = 'O campo :attribute deve ser um texto.';
$lines['unique'] = 'O :attribute já está em uso.';
$lines['url'] = 'O campo :attribute deve ser uma URL válida.';
$lines['attributes'] = [
    'name' => 'nome',
    'email' => 'e-mail',
    'password' => 'senha',
    'password_confirmation' => 'confirmação de senha',
    'current_password' => 'senha atual',
    'role' => 'função',
    'price' => 'preço',
    'description' => 'descrição',
    'status' => 'status',
    'items' => 'itens',
    'quantity' => 'quantidade',
    'invitation' => 'convite',
];

return $lines;
