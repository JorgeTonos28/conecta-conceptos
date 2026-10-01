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
    <meta name="theme-color" content="#0B2341">
    <title>Una conexión inesperada — Pantalla</title>
    <link rel="stylesheet" href="assets/css/app.css">
</head>
<body class="screen-page">
<main class="screen-shell">
    <section id="waitingScreen" class="screen-stage">
        <div class="screen-copy">
            <p class="eyebrow light">DINÁMICA INTERACTIVA</p>
            <h1>Una conexión<br><em>inesperada</em></h1>
            <p>Escanea el código, escribe tu primer nombre y sigue las instrucciones en tu teléfono.</p>
            <div class="counter"><strong id="screenCount">0</strong><span>/</span><strong id="screenTarget">6</strong><small>participantes listos</small></div>
            <div class="short-url"><?= htmlspecialchars($participantUrl) ?></div>
        </div>
        <div class="qr-frame">
            <img src="<?= htmlspecialchars($qrUrl) ?>" alt="Código QR para acceder a la dinámica">
        </div>
    </section>

    <section id="revealedScreen" class="screen-stage reveal-stage" hidden>
        <p class="eyebrow light">LAS CONEXIONES APARECEN</p>
        <h2>Conceptos que se complementan</h2>
        <div id="connectionGrid" class="connection-grid"></div>
        <div class="screen-surprise">
            <span>¡Sorpresa!</span>
            <strong>Estas conexiones serán sus comunidades de aprendizaje.</strong>
        </div>
        <p class="screen-commitment">Compartiremos conocimientos, nos apoyaremos ante las dificultades y procuraremos que todos desarrollemos las competencias previstas.</p>
    </section>
</main>
<script src="assets/js/screen.js"></script>
</body>
</html>
