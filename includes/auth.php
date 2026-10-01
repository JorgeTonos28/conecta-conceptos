<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';

function start_secure_session(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $secure = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');

    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Strict',
    ]);

    ini_set('session.use_strict_mode', '1');
    session_start();
}

function admin_password_configured(): bool
{
    $password = (string) app_config('ADMIN_PASSWORD', '');
    return $password !== '' && $password !== 'CAMBIA-ESTA-CLAVE';
}

function admin_login(string $password): bool
{
    $expected = (string) app_config('ADMIN_PASSWORD', '');

    if (!admin_password_configured() || !hash_equals($expected, $password)) {
        return false;
    }

    start_secure_session();
    session_regenerate_id(true);
    $_SESSION['is_admin'] = true;
    $_SESSION['csrf'] = bin2hex(random_bytes(24));
    return true;
}

function admin_logout(): void
{
    start_secure_session();
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], '', (bool)$params['secure'], (bool)$params['httponly']);
    }
    session_destroy();
}

function require_admin(): void
{
    start_secure_session();
    if (empty($_SESSION['is_admin'])) {
        http_response_code(401);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => false, 'error' => 'No autorizado.']);
        exit;
    }
}

function csrf_token(): string
{
    start_secure_session();
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(24));
    }
    return (string)$_SESSION['csrf'];
}

function require_csrf(string $token): void
{
    require_admin();
    $expected = csrf_token();

    if ($token === '' || !hash_equals($expected, $token)) {
        http_response_code(419);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => false, 'error' => 'Token de seguridad inválido.']);
        exit;
    }
}
