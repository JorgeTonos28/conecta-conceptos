<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/auth.php';
require_once dirname(__DIR__) . '/includes/concepts.php';
require_once dirname(__DIR__) . '/includes/config.php';

start_secure_session();

$error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['password'])) {
    if (admin_login((string)$_POST['password'])) {
        header('Location: ./');
        exit;
    }
    $error = 'Clave incorrecta o configuración pendiente.';
}

$isAdmin = !empty($_SESSION['is_admin']);
$pairs = concept_pairs();
?>
<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#123A6D">
    <title>Panel del facilitador</title>
    <link rel="stylesheet" href="../assets/css/app.css">
</head>
<body class="admin-page">
<?php if (!$isAdmin): ?>
<main class="login-shell">
    <section class="panel login-panel">
        <p class="eyebrow">ACCESO PRIVADO</p>
        <h1>Panel del facilitador</h1>
        <?php if (!admin_password_configured()): ?>
            <div class="warning-box">
                Primero configura <code>ADMIN_PASSWORD</code> en el archivo <code>.env</code> del servidor.
            </div>
        <?php endif; ?>
        <form method="post" class="stack">
            <label for="password">Clave del facilitador</label>
            <input id="password" type="password" name="password" autocomplete="current-password" required>
            <button class="primary-button" type="submit">Entrar</button>
        </form>
        <?php if ($error): ?><p class="error-message"><?= htmlspecialchars($error) ?></p><?php endif; ?>
    </section>
</main>
<?php else: ?>
<main class="admin-shell" data-csrf="<?= htmlspecialchars(csrf_token()) ?>">
    <header class="admin-header">
        <div>
            <p class="eyebrow">CAONA LABS · CONTROL</p>
            <h1>Una conexión inesperada</h1>
        </div>
        <div class="admin-header-actions">
            <a class="secondary-button" href="../pantalla.php" target="_blank">Abrir pantalla de proyección</a>
            <a class="text-button" href="logout.php">Salir</a>
        </div>
    </header>

    <section class="admin-stats">
        <article><span>Participantes</span><strong id="adminCount">0 / 6</strong></article>
        <article><span>Tarjetas reveladas</span><strong id="adminAssigned">0</strong></article>
        <article><span>Estado</span><strong id="adminStatus">Preparando</strong></article>
        <article><span>Sesión</span><strong id="adminSession">—</strong></article>
    </section>

    <div class="admin-grid">
        <section class="panel admin-panel">
            <div class="panel-heading">
                <div>
                    <p class="eyebrow">PARTICIPANTES</p>
                    <h2>Registro en vivo</h2>
                </div>
                <label class="toggle-line"><input id="showConcepts" type="checkbox"> Ver conceptos</label>
            </div>
            <div id="participantsTable" class="participants-table"></div>
        </section>

        <section class="panel admin-panel">
            <p class="eyebrow">CONTROL</p>
            <h2>Experiencia</h2>
            <p class="muted">La revelación es el momento sorpresa. No la ejecutes hasta que los participantes hayan encontrado su complemento.</p>
            <button id="revealButton" class="reveal-button" type="button">Revelar conexiones</button>
            <p id="adminMessage" class="status-message"></p>
        </section>

        <section class="panel admin-panel full-width">
            <p class="eyebrow">NUEVA EXPERIENCIA</p>
            <h2>Configurar y reiniciar</h2>
            <div class="setup-grid">
                <div>
                    <label for="targetSelect">Cantidad de participantes</label>
                    <select id="targetSelect">
                        <option value="2">2 participantes</option>
                        <option value="4">4 participantes</option>
                        <option value="6" selected>6 participantes</option>
                        <option value="8">8 participantes</option>
                        <option value="10">10 participantes</option>
                    </select>
                </div>
                <div class="pair-options" id="pairOptions">
                    <?php foreach ($pairs as $id => $pair): ?>
                        <label>
                            <input type="checkbox" value="<?= htmlspecialchars($id) ?>">
                            <span><?= htmlspecialchars($pair['concepts'][0]['label']) ?> ↔ <?= htmlspecialchars($pair['concepts'][1]['label']) ?></span>
                        </label>
                    <?php endforeach; ?>
                </div>
            </div>
            <button id="resetButton" class="danger-outline-button" type="button">Iniciar experiencia limpia</button>
            <p class="muted tiny">Reiniciar elimina los nombres capturados y vuelve a mezclar todas las tarjetas.</p>
        </section>
    </div>
</main>
<script src="../assets/js/facilitator.js"></script>
<?php endif; ?>
</body>
</html>
