<?php
declare(strict_types=1);

require_once __DIR__ . '/common.php';
require_once dirname(__DIR__) . '/includes/auth.php';
require_once dirname(__DIR__) . '/includes/state.php';

require_admin();

$state = read_state();
$pairs = concept_pairs();

json_response([
    'ok' => true,
    'state' => $state,
    'pairs' => $pairs,
    'public' => public_state($state),
]);
