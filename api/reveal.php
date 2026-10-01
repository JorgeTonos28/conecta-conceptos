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

try {
    $state = mutate_state(function (array $state): array {
        $assigned = array_values(array_filter($state['participants'], static fn($p) => !empty($p['concept_id'])));
        if (count($assigned) < 2) {
            throw new RuntimeException('Se necesitan al menos dos tarjetas asignadas para revelar conexiones.');
        }

        $state['revealed'] = true;
        return $state;
    });

    json_response(['ok' => true, 'state' => public_state($state)]);
} catch (Throwable $e) {
    json_response(['ok' => false, 'error' => $e->getMessage()], 409);
}
