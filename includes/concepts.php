<?php
declare(strict_types=1);

function concept_pairs(): array
{
    return [
        'datos-validacion' => [
            'name' => 'Calidad de datos',
            'concepts' => [
                [
                    'id' => 'datos',
                    'label' => 'DATOS',
                    'hint' => 'Mi complemento establece reglas para controlar cómo puedo ser ingresado.'
                ],
                [
                    'id' => 'validacion',
                    'label' => 'VALIDACIÓN',
                    'hint' => 'Mi complemento representa la información que quiero controlar antes de almacenarla.'
                ],
            ],
        ],
        'ficha-registro' => [
            'name' => 'Gestión del registro',
            'concepts' => [
                [
                    'id' => 'ficha',
                    'label' => 'FICHA',
                    'hint' => 'Mi complemento es el lugar donde la información capturada queda conservada.'
                ],
                [
                    'id' => 'registro',
                    'label' => 'REGISTRO',
                    'hint' => 'Mi complemento organiza los campos que permiten recopilar la información.'
                ],
            ],
        ],
        'macro-automatizacion' => [
            'name' => 'Automatización',
            'concepts' => [
                [
                    'id' => 'macro',
                    'label' => 'MACRO',
                    'hint' => 'Mi complemento describe el propósito de ejecutar tareas repetitivas de manera automática.'
                ],
                [
                    'id' => 'automatizacion',
                    'label' => 'AUTOMATIZACIÓN',
                    'hint' => 'Mi complemento es un recurso de Excel capaz de ejecutar una secuencia de acciones.'
                ],
            ],
        ],
        'formulario-captura' => [
            'name' => 'Diseño de captura',
            'concepts' => [
                [
                    'id' => 'formulario',
                    'label' => 'FORMULARIO',
                    'hint' => 'Mi complemento representa la acción de introducir información de manera organizada.'
                ],
                [
                    'id' => 'captura',
                    'label' => 'CAPTURA',
                    'hint' => 'Mi complemento organiza visualmente los campos donde introduzco información.'
                ],
            ],
        ],
        'lista-desplegable' => [
            'name' => 'Control de entradas',
            'concepts' => [
                [
                    'id' => 'lista',
                    'label' => 'LISTA',
                    'hint' => 'Mi complemento describe la forma visual en que puedo mostrar opciones para seleccionar.'
                ],
                [
                    'id' => 'desplegable',
                    'label' => 'DESPLEGABLE',
                    'hint' => 'Mi complemento contiene el conjunto de opciones que puedo seleccionar.'
                ],
            ],
        ],
    ];
}
