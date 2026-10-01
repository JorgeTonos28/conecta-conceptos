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

$target = (int)($data['target'] ?? 6);
$pairIds = array_values(array_unique(array_map('strval', $data['pair_ids'] ?? [])));
$allowedTargets = [2, 4, 6, 8, 10];

if (!in_array($target, $allowedTargets, true)) {
    json_response(['ok' => false, 'error' => 'Selecciona una cantidad par entre 2 y 10 participantes.'], 422);
}

$pairs = concept_pairs();
$pairIds = array_values(array_filter($pairIds, static fn($id) => isset($pairs[$id])));

if (count($pairIds) !== intdiv($target, 2)) {
    json_response([
        'ok' => false,
        'error' => 'Selecciona exactamente ' . intdiv($target, 2) . ' pares conceptuales para ' . $target . ' participantes.'
    ], 422);
}

$state = mutate_state(function (array $state) use ($target, $pairIds): array {
    return [
        'version' => 1,
        'session_id' => strtoupper(substr(bin2hex(random_bytes(4)), 0, 6)),
        'target' => $target,
        'pair_ids' => $pairIds,
        'revealed' => false,
        'created_at' => gmdate('c'),
        'participants' => [],
    ];
});

json_response(['ok' => true, 'state' => $state, 'public' => public_state($state)]);
