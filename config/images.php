<?php

return [

    'max_upload_bytes' => 10 * 1024 * 1024,

    'min_dimension' => 200,

    'max_dimension' => 6000,

    'quality' => 80,

    'allowed_mimes' => [
        'image/jpeg',
        'image/png',
        'image/webp',
    ],

    'variants' => [
        'product_main' => [
            'max_width' => 1200,
            'max_height' => 1200,
            'mode' => 'scaleDown',
        ],
        'logo' => [
            'max_width' => 800,
            'max_height' => 800,
            'mode' => 'scaleDown',
        ],
        'cover' => [
            'max_width' => 1600,
            'max_height' => 900,
            'mode' => 'cover',
        ],
    ],

];
