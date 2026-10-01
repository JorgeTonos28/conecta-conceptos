<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/config.php';
?>
<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
    <meta name="theme-color" content="#123A6D">
    <title>Una conexión inesperada</title>
    <link rel="stylesheet" href="assets/css/app.css">
</head>
<body class="participant-page">
<main class="participant-shell">
    <div class="brand-mark"><span></span><span></span><span></span></div>

    <section id="joinView" class="panel participant-panel">
        <p class="eyebrow">DINÁMICA INTERACTIVA</p>
        <h1>Una conexión<br><em>inesperada</em></h1>
        <p class="lead">Escribe únicamente tu primer nombre para comenzar.</p>

        <form id="joinForm" class="stack">
            <label for="firstName">Tu primer nombre</label>
            <input id="firstName" name="firstName" autocomplete="given-name" maxlength="32" placeholder="Ej. Laura" required>
            <button class="primary-button" type="submit">Continuar</button>
        </form>
        <p id="joinError" class="error-message" hidden></p>
    </section>

    <section id="cardView" class="panel participant-panel" hidden>
        <p class="eyebrow">ELIGE POR INTUICIÓN</p>
        <h2>Escoge una tarjeta</h2>
        <p class="lead">No hay respuestas correctas. Elige la que más te llame la atención.</p>
        <div class="card-choice-grid" id="cardChoices" aria-label="Tarjetas disponibles">
            <button class="mystery-card" type="button" aria-label="Tarjeta 1"><span>?</span></button>
            <button class="mystery-card" type="button" aria-label="Tarjeta 2"><span>?</span></button>
            <button class="mystery-card" type="button" aria-label="Tarjeta 3"><span>?</span></button>
            <button class="mystery-card" type="button" aria-label="Tarjeta 4"><span>?</span></button>
        </div>
        <p id="cardError" class="error-message" hidden></p>
    </section>

    <section id="conceptView" class="panel participant-panel concept-panel" hidden>
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
        <p class="mission">
            Busca a la persona que tenga el concepto que <strong>complemente el tuyo</strong>.
            Cuando creas haberla encontrado, permanece a su lado y espera la siguiente señal.
        </p>
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
<script src="assets/js/participant.js"></script>
</body>
</html>
