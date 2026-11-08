<?php
require_once 'includes/functions.php';

$error = "";
$success = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();

    $name = trim($_POST['name'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $subject = trim($_POST['subject'] ?? '');
    $message = trim($_POST['message'] ?? '');

    if (
        $name === '' ||
        !filter_var($email, FILTER_VALIDATE_EMAIL) ||
        $subject === '' ||
        $message === ''
    ) {
        $error = "يرجى تعبئة جميع الحقول بصورة صحيحة.";
    } else {
        $stmt = $pdo->prepare(
            "INSERT INTO messages (name, email, subject, message)
             VALUES (?, ?, ?, ?)"
        );

        $stmt->execute([$name, $email, $subject, $message]);

        $success = "تم إرسال رسالتك بنجاح. شكراً لتواصلك معنا.";
    }
}
?>

