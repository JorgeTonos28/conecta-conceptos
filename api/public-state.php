<?php
declare(strict_types=1);

require_once __DIR__ . '/common.php';
require_once dirname(__DIR__) . '/includes/state.php';

try {
    json_response(['ok' => true, 'state' => public_state(read_state())]);
} catch (Throwable $e) {
    json_response(['ok' => false, 'error' => 'No se pudo leer el estado.'], 500);
}
