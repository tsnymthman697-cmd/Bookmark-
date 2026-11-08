<?php
require_once 'includes/functions.php';

if (!empty($_SESSION['user_id'])) {
    redirect("home.php");
}

$error = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();

    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $error = "أدخل بريداً إلكترونياً صحيحاً.";
    } else {
        $stmt = $pdo->prepare(
            "SELECT * FROM users WHERE email = ?"
        );
        $stmt->execute([$email]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['password'])) {
            session_regenerate_id(true);

            $_SESSION['user_id'] = $user['id'];

            redirect("home.php");
        } else {
            $error = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
        }
    }
}
?>

