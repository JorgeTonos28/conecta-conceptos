<?php
declare(strict_types=1);

require_once __DIR__ . '/common.php';
require_once dirname(__DIR__) . '/includes/state.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['ok' => false, 'error' => 'Método no permitido.'], 405);
}

$data = json_input();
$name = clean_name((string)($data['name'] ?? ''));

if ($name === '') {
    json_response(['ok' => false, 'error' => 'Escribe tu primer nombre.'], 422);
}

try {
    $token = bin2hex(random_bytes(18));
    $created = null;

    $state = mutate_state(function (array $state) use ($name, $token, &$created): array {
        if ($state['revealed']) {
            throw new RuntimeException('La experiencia ya fue revelada.');
        }

        if (count($state['participants']) >= $state['target']) {
            throw new OverflowException('Ya se alcanzó el número de participantes configurado.');
        }

        foreach ($state['participants'] as $participant) {
            if (strcasecmp((string)$participant['name'], $name) === 0) {
                throw new InvalidArgumentException('Ese nombre ya está registrado. Si eres tú, vuelve al mismo dispositivo para recuperar tu tarjeta.');
            }
        }

        $created = [
            'id' => bin2hex(random_bytes(6)),
            'token' => $token,
            'name' => $name,
            'pair_id' => null,
            'pair_name' => null,
            'concept_id' => null,
            'concept_label' => null,
            'hint' => null,
            'joined_at' => gmdate('c'),
        ];

        $state['participants'][] = $created;
        return $state;
    });

    json_response([
        'ok' => true,
        'token' => $token,
        'participant' => [
            'name' => $created['name'],
            'has_concept' => false,
        ],
        'state' => public_state($state),
    ]);
} catch (OverflowException|InvalidArgumentException|RuntimeException $e) {
    json_response(['ok' => false, 'error' => $e->getMessage()], 409);
} catch (Throwable $e) {
    json_response(['ok' => false, 'error' => 'No se pudo completar el registro.'], 500);
}
