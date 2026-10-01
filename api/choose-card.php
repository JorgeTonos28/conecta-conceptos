<?php
declare(strict_types=1);

require_once __DIR__ . '/common.php';
require_once dirname(__DIR__) . '/includes/state.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['ok' => false, 'error' => 'Método no permitido.'], 405);
}

$data = json_input();
$token = trim((string)($data['token'] ?? ''));

if ($token === '') {
    json_response(['ok' => false, 'error' => 'Sesión de participante inválida.'], 422);
}

try {
    $selected = null;

    $state = mutate_state(function (array $state) use ($token, &$selected): array {
        if ($state['revealed']) {
            throw new RuntimeException('La experiencia ya fue revelada.');
        }

        $index = null;
        foreach ($state['participants'] as $i => $participant) {
            if (hash_equals((string)$participant['token'], $token)) {
                $index = $i;
                break;
            }
        }

        if ($index === null) {
            throw new InvalidArgumentException('No encontramos tu registro.');
        }

        if (!empty($state['participants'][$index]['concept_id'])) {
            $selected = $state['participants'][$index];
            return $state;
        }

        $pool = flatten_concepts($state['pair_ids']);
        $used = array_filter(array_column($state['participants'], 'concept_id'));
        $available = array_values(array_filter(
            $pool,
            static fn($item) => !in_array($item['id'], $used, true)
        ));

        if (!$available) {
            throw new OverflowException('No quedan tarjetas disponibles.');
        }

        $concept = $available[random_int(0, count($available) - 1)];
        $state['participants'][$index]['pair_id'] = $concept['pair_id'];
        $state['participants'][$index]['pair_name'] = $concept['pair_name'];
        $state['participants'][$index]['concept_id'] = $concept['id'];
        $state['participants'][$index]['concept_label'] = $concept['label'];
        $state['participants'][$index]['hint'] = $concept['hint'];
        $selected = $state['participants'][$index];

        return $state;
    });

    json_response([
        'ok' => true,
        'participant' => [
            'name' => $selected['name'],
            'concept' => $selected['concept_label'],
            'hint' => $selected['hint'],
        ],
        'state' => public_state($state),
    ]);
} catch (Throwable $e) {
    $status = $e instanceof RuntimeException || $e instanceof InvalidArgumentException || $e instanceof OverflowException ? 409 : 500;
    json_response(['ok' => false, 'error' => $e->getMessage() ?: 'No se pudo seleccionar la tarjeta.'], $status);
}
