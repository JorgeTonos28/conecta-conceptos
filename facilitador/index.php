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
    <link rel="stylesheet" href="../assets/css/app.css?v=<?= filemtime(dirname(__DIR__) . '/assets/css/app.css') ?>">
</head>
<body class="admin-page">
<?php if (!$isAdmin): ?>
<main class="login-shell">
    <section class="panel login-panel">
        <div class="brand-mark"><span></span><span></span><span></span></div>
        <p class="eyebrow">ACCESO PRIVADO</p>
        <h1>Panel del facilitador</h1>
        <p class="lead">Controla la experiencia, supervisa el registro y decide cuándo revelar las conexiones.</p>
        <?php if (!admin_password_configured()): ?>
            <div class="warning-box">
                Primero configura <code>ADMIN_PASSWORD</code> en el archivo <code>.env</code> del servidor.
            </div>
        <?php endif; ?>
        <form method="post" class="stack">
            <label for="password">Clave del facilitador</label>
            <input id="password" type="password" name="password" autocomplete="current-password" required>
            <button class="primary-button" type="submit">Entrar al panel</button>
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
            <p>Panel privado del facilitador</p>
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
                <label class="toggle-line"><input id="showConcepts" type="checkbox"> Mostrar conceptos en panel</label>
            </div>
            <div id="participantsTable" class="participants-table"></div>
        </section>

        <section class="panel admin-panel reveal-control-panel">
            <p class="eyebrow">MOMENTO SORPRESA</p>
            <h2>Revelación</h2>
            <p class="muted">No reveles las conexiones hasta que los participantes crean haber encontrado su complemento.</p>
            <div class="reveal-orb" aria-hidden="true"><span></span><i></i><b></b></div>
            <button id="revealButton" class="reveal-button" type="button">Revelar conexiones</button>
            <p id="adminMessage" class="status-message"></p>
        </section>

        <section class="panel admin-panel full-width setup-panel">
            <div class="setup-heading">
                <div>
                    <p class="eyebrow">CONFIGURACIÓN</p>
                    <h2>Prepara una nueva experiencia</h2>
                </div>
                <span id="setupState" class="setup-state">Configuración activa</span>
            </div>

            <div class="setup-grid">
                <div class="setup-column">
                    <label for="targetSelect">Cantidad de participantes</label>
                    <select id="targetSelect">
                        <option value="2">2 participantes</option>
                        <option value="4">4 participantes</option>
                        <option value="6">6 participantes</option>
                        <option value="8">8 participantes</option>
                        <option value="10">10 participantes</option>
                    </select>
                    <p class="muted tiny">La dinámica trabaja con parejas conceptuales, por eso la cantidad es par.</p>

                    <div class="setup-counter">
                        <span>Pares seleccionados</span>
                        <strong id="selectedPairsCount">0 / 3</strong>
                    </div>

                    <p id="setupHint" class="setup-hint"></p>

                    <div class="setup-actions-inline">
                        <button id="suggestPairsButton" class="ghost-button" type="button">Sugerir pares</button>
                        <button id="restoreSetupButton" class="ghost-button" type="button">Restaurar activa</button>
                    </div>
                </div>

                <div class="setup-column">
                    <span class="field-label">Pares conceptuales</span>
                    <div class="pair-options" id="pairOptions">
                        <?php foreach ($pairs as $id => $pair): ?>
                            <label>
                                <input type="checkbox" value="<?= htmlspecialchars($id) ?>">
                                <span>
                                    <strong><?= htmlspecialchars($pair['concepts'][0]['label']) ?></strong>
                                    <i>↔</i>
                                    <strong><?= htmlspecialchars($pair['concepts'][1]['label']) ?></strong>
                                    <small><?= htmlspecialchars($pair['name']) ?></small>
                                </span>
                            </label>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>

            <div class="setup-footer">
                <p class="muted tiny">Aplicar la configuración reinicia la experiencia, elimina los nombres actuales y vuelve a mezclar las tarjetas.</p>
                <button id="resetButton" class="danger-outline-button" type="button">Aplicar configuración e iniciar</button>
            </div>
        </section>
    </div>
</main>
<script src="../assets/js/facilitator.js?v=<?= filemtime(dirname(__DIR__) . '/assets/js/facilitator.js') ?>"></script>
<?php endif; ?>
</body>
</html>
