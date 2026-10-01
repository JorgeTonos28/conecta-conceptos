<?php
declare(strict_types=1);
require_once __DIR__ . '/includes/config.php';
$participantUrl = app_url() . '/';
$qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=420x420&margin=14&data=' . urlencode($participantUrl);
?>
<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#07192D">
    <title>Una conexión inesperada — Pantalla</title>
    <link rel="stylesheet" href="assets/css/app.css?v=<?= filemtime(__DIR__ . '/assets/css/app.css') ?>">
</head>
<body class="screen-page">
<canvas class="three-backdrop" data-three-scene="screen" aria-hidden="true"></canvas>
<div class="screen-noise" aria-hidden="true"></div>

<main class="screen-shell">
    <section id="waitingScreen" class="screen-stage waiting-stage">
        <div class="screen-copy">
            <div class="screen-badge">DINÁMICA INTERACTIVA</div>
            <h1>Una conexión<br><em>inesperada</em></h1>
            <p>Escanea el código, escribe tu primer nombre y sigue las instrucciones en tu teléfono.</p>

            <div class="screen-meta-row">
                <div class="counter">
                    <strong id="screenCount">0</strong><span>/</span><strong id="screenTarget">6</strong>
                    <small>participantes listos</small>
                </div>
                <div class="live-pill"><i></i> En vivo</div>
            </div>

            <div class="short-url"><?= htmlspecialchars($participantUrl) ?></div>
        </div>

        <div class="qr-stage">
            <div class="qr-orbit orbit-a"></div>
            <div class="qr-orbit orbit-b"></div>
            <div class="qr-frame">
                <div class="qr-label">ESCANEA PARA COMENZAR</div>
                <img src="<?= htmlspecialchars($qrUrl) ?>" alt="Código QR para acceder a la dinámica">
            </div>
        </div>
    </section>

    <section id="revealedScreen" class="screen-stage reveal-stage" hidden>
        <div class="screen-badge">LAS CONEXIONES APARECEN</div>
        <h2>Conceptos que se complementan</h2>
        <p class="reveal-intro">Lo que parecía una elección individual estaba construyendo algo más.</p>

        <div id="connectionGrid" class="connection-grid"></div>

        <div class="screen-surprise">
            <span>¡SORPRESA!</span>
            <strong>Estas conexiones serán sus comunidades de aprendizaje.</strong>
        </div>

        <p class="screen-commitment">
            Compartiremos conocimientos, nos apoyaremos ante las dificultades y procuraremos que todos desarrollemos las competencias previstas.
        </p>
    </section>
</main>

<script src="assets/js/screen.js?v=<?= filemtime(__DIR__ . '/assets/js/screen.js') ?>"></script>
<script type="module" src="assets/js/three-scenes.js?v=<?= filemtime(__DIR__ . '/assets/js/three-scenes.js') ?>"></script>
</body>
</html>
