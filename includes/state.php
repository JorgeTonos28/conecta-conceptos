<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/concepts.php';

function state_file_path(): string
{
    $configured = trim((string) app_config('STATE_FILE', ''));
    if ($configured !== '') {
        return $configured;
    }

    return dirname(__DIR__) . '/storage/state.json';
}

function default_state(): array
{
    return [
        'version' => 1,
        'session_id' => strtoupper(substr(bin2hex(random_bytes(4)), 0, 6)),
        'target' => 6,
        'pair_ids' => ['datos-validacion', 'ficha-registro', 'macro-automatizacion'],
        'revealed' => false,
        'created_at' => gmdate('c'),
        'participants' => [],
    ];
}

function normalize_state(array $state): array
{
    $pairs = concept_pairs();
    $state['target'] = (int)($state['target'] ?? 6);
    $state['pair_ids'] = array_values(array_filter(
        $state['pair_ids'] ?? [],
        static fn($id) => isset($pairs[$id])
    ));
    $state['participants'] = array_values($state['participants'] ?? []);
    $state['revealed'] = (bool)($state['revealed'] ?? false);
    return $state;
}

function read_state(): array
{
    $path = state_file_path();
    $dir = dirname($path);

    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }

    $fp = fopen($path, 'c+');
    if ($fp === false) {
        throw new RuntimeException('No se pudo abrir el archivo de estado.');
    }

    try {
        flock($fp, LOCK_EX);
        rewind($fp);
        $raw = stream_get_contents($fp);
        $state = $raw ? json_decode($raw, true) : null;

        if (!is_array($state)) {
            $state = default_state();
            ftruncate($fp, 0);
            rewind($fp);
            fwrite($fp, json_encode($state, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            fflush($fp);
        }

        flock($fp, LOCK_UN);
        return normalize_state($state);
    } finally {
        fclose($fp);
    }
}

function mutate_state(callable $callback): array
{
    $path = state_file_path();
    $dir = dirname($path);

    if (!is_dir($dir)) {
        mkdir($dir, 0775, true);
    }

    $fp = fopen($path, 'c+');
    if ($fp === false) {
        throw new RuntimeException('No se pudo abrir el archivo de estado.');
    }

    try {
        if (!flock($fp, LOCK_EX)) {
            throw new RuntimeException('No se pudo bloquear el archivo de estado.');
        }

        rewind($fp);
        $raw = stream_get_contents($fp);
        $state = $raw ? json_decode($raw, true) : null;
        if (!is_array($state)) {
            $state = default_state();
        }

        $state = normalize_state($state);
        $state = $callback($state);
        $state = normalize_state($state);

        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, json_encode($state, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        fflush($fp);
        flock($fp, LOCK_UN);

        return $state;
    } finally {
        fclose($fp);
    }
}

function flatten_concepts(array $pairIds): array
{
    $pairs = concept_pairs();
    $items = [];

    foreach ($pairIds as $pairId) {
        if (!isset($pairs[$pairId])) {
            continue;
        }

        foreach ($pairs[$pairId]['concepts'] as $concept) {
            $items[] = [
                'pair_id' => $pairId,
                'pair_name' => $pairs[$pairId]['name'],
                'id' => $concept['id'],
                'label' => $concept['label'],
                'hint' => $concept['hint'],
            ];
        }
    }

    return $items;
}

function public_state(array $state): array
{
    $participants = $state['participants'];
    $assigned = array_values(array_filter($participants, static fn($p) => !empty($p['concept_id'])));

    $response = [
        'session_id' => $state['session_id'],
        'target' => $state['target'],
        'count' => count($participants),
        'assigned_count' => count($assigned),
        'revealed' => $state['revealed'],
    ];

    if ($state['revealed']) {
        $pairs = concept_pairs();
        $groups = [];

        foreach ($state['pair_ids'] as $pairId) {
            $members = array_values(array_filter(
                $assigned,
                static fn($p) => ($p['pair_id'] ?? null) === $pairId
            ));

            if (!$members) {
                continue;
            }

            $groups[] = [
                'pair_id' => $pairId,
                'name' => $pairs[$pairId]['name'] ?? 'Conexión',
                'members' => array_map(static fn($p) => [
                    'name' => $p['name'],
                    'concept' => $p['concept_label'],
                ], $members),
            ];
        }

        $response['groups'] = $groups;
    }

    return $response;
}

function find_participant(array $state, string $token): ?array
{
    foreach ($state['participants'] as $participant) {
        if (hash_equals((string)$participant['token'], $token)) {
            return $participant;
        }
    }

    return null;
}
