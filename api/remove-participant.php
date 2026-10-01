<?php
declare(strict_types=1);

require_once __DIR__ . '/common.php';
require_once dirname(__DIR__) . '/includes/auth.php';
require_once dirname(__DIR__) . '/includes/state.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['ok' => false, 'error' => 'Método no permitido.'], 405);
}

$data = json_input();
require_csrf((string)($data['csrf'] ?? ''));

$id = trim((string)($data['id'] ?? ''));
if ($id === '') {
    json_response(['ok' => false, 'error' => 'Participante inválido.'], 422);
}

$state = mutate_state(function (array $state) use ($id): array {
    if ($state['revealed']) {
        throw new RuntimeException('Reinicia la experiencia antes de eliminar participantes después de la revelación.');
    }

    $state['participants'] = array_values(array_filter(
        $state['participants'],
        static fn($p) => ($p['id'] ?? '') !== $id
    ));
    return $state;
});

json_response(['ok' => true, 'state' => $state]);
