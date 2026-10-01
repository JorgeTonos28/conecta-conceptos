<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/config.php';
?>
<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#0B2341">
    <title>Una conexión inesperada</title>
    <link rel="stylesheet" href="assets/css/app.css?v=<?= filemtime(__DIR__ . '/assets/css/app.css') ?>">
</head>
<body class="participant-page">
<canvas class="three-backdrop" data-three-scene="participant" aria-hidden="true"></canvas>
<div class="ambient-grid" aria-hidden="true"></div>

<main class="participant-shell">
    <div class="brand-mark"><span></span><span></span><span></span></div>

    <section id="joinView" class="panel participant-panel hero-panel">
        <div class="panel-orbit" aria-hidden="true"><span></span><i></i><b></b></div>
        <p class="eyebrow">DINÁMICA INTERACTIVA</p>
        <h1>Una conexión<br><em>inesperada</em></h1>
        <p class="lead">Escribe únicamente tu primer nombre. Lo demás lo descubrirás en el camino.</p>

        <form id="joinForm" class="stack">
            <label for="firstName">Tu primer nombre</label>
            <input id="firstName" name="firstName" autocomplete="given-name" maxlength="32" placeholder="Ej. Laura" required>
            <button class="primary-button magnetic" type="submit"><span>Comenzar</span><i>→</i></button>
        </form>
        <p id="joinError" class="error-message" hidden></p>
    </section>

    <section id="cardView" class="panel participant-panel card-stage-panel" hidden>
        <p class="eyebrow">ELIGE POR AFINIDAD</p>
        <h2>¿Con cuál concepto te identificas más?</h2>
        <p class="lead">Elige uno de los conceptos disponibles. Cada concepto tiene un solo cupo y, cuando alguien lo elige, deja de estar disponible para los demás.</p>

        <div class="availability-strip" aria-live="polite">
            <span>Disponibles ahora</span>
            <strong id="availableCount">—</strong>
        </div>

        <div class="card-choice-grid concept-choice-grid" id="cardChoices" aria-label="Conceptos disponibles"></div>

        <p class="microcopy">Los cupos se actualizan en tiempo real. Una vez confirmada tu elección, no podrás cambiarla.</p>
        <p id="cardError" class="error-message" hidden></p>
    </section>

    <section id="conceptView" class="panel participant-panel concept-panel" hidden>
        <div class="concept-halo" aria-hidden="true"></div>
        <p class="eyebrow">TU TARJETA</p>
        <p class="participant-name" id="participantName"></p>
        <div class="concept-card">
            <span class="concept-kicker">Tu concepto es</span>
            <strong id="conceptLabel"></strong>
            <div class="hint-box">
                <span>Pista</span>
                <p id="conceptHint"></p>
            </div>
        </div>
        <div class="mission-card">
            <span class="mission-number">01</span>
            <p class="mission">
                Busca a la persona que tenga el concepto que <strong>complemente el tuyo</strong>.
                Cuando creas haberla encontrado, permanece a su lado y espera la siguiente señal.
            </p>
        </div>
    </section>

    <section id="revealView" class="panel participant-panel reveal-panel" hidden>
        <p class="eyebrow">CONEXIÓN ENCONTRADA</p>
        <h2 id="connectionName"></h2>
        <div id="partnerList" class="partner-list"></div>
        <div class="surprise-message">
            <span>¡Sorpresa!</span>
            <strong>Esta conexión será tu comunidad de aprendizaje.</strong>
        </div>
        <p class="commitment">
            Compartiremos conocimientos, nos apoyaremos ante las dificultades y procuraremos que todos desarrollemos las competencias previstas.
        </p>
    </section>
</main>

<script src="assets/js/participant.js?v=<?= filemtime(__DIR__ . '/assets/js/participant.js') ?>"></script>
<script type="module" src="assets/js/three-scenes.js?v=<?= filemtime(__DIR__ . '/assets/js/three-scenes.js') ?>"></script>
</body>
</html>
