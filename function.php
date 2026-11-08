<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../config/database.php';

function e($value) {
    return htmlspecialchars((string)$value, ENT_QUOTES, 'UTF-8');
}

function redirect($page) {
    header("Location: $page");
    exit;
}

function require_login() {
    if (empty($_SESSION['user_id'])) {
        redirect("index.php");
    }
}

function csrf_token() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    return $_SESSION['csrf_token'];
}

function verify_csrf() {
    $token = $_POST['csrf_token'] ?? '';

    if (
        empty($_SESSION['csrf_token']) ||
        !hash_equals($_SESSION['csrf_token'], $token)
    ) {
        http_response_code(403);
        exit("طلب غير صالح. أعد تحميل الصفحة وحاول مرة أخرى.");
    }
}

function current_user() {
    global $pdo;

    if (empty($_SESSION['user_id'])) {
        return null;
    }

    $stmt = $pdo->prepare(
        "SELECT id, fullname, email, account_type
         FROM users WHERE id = ?"
    );

    $stmt->execute([$_SESSION['user_id']]);

    return $stmt->fetch() ?: null;
}