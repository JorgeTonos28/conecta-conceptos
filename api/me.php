<?php
declare(strict_types=1);

require_once __DIR__ . '/common.php';
require_once dirname(__DIR__) . '/includes/state.php';

$token = trim((string)($_GET['token'] ?? ''));
if ($token === '') {
    json_response(['ok' => false, 'error' => 'Sin sesión.'], 404);
}

$state = read_state();
$participant = find_participant($state, $token);

if (!$participant) {
    json_response(['ok' => false, 'error' => 'Participante no encontrado.'], 404);
}

$payload = [
    'name' => $participant['name'],
    'concept' => $participant['concept_label'],
    'hint' => $participant['hint'],
    'revealed' => $state['revealed'],
];

if ($state['revealed'] && !empty($participant['pair_id'])) {
    $partners = array_values(array_filter(
        $state['participants'],
        static fn($p) => ($p['pair_id'] ?? null) === $participant['pair_id'] && ($p['token'] ?? '') !== $participant['token']
    ));

    $payload['connection_name'] = $participant['pair_name'];
    $payload['partners'] = array_map(static fn($p) => [
        'name' => $p['name'],
        'concept' => $p['concept_label'],
    ], $partners);
}

json_response(['ok' => true, 'participant' => $payload]);
