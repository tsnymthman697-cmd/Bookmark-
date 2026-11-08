<?php
require_once 'includes/functions.php';

$error = "";
$success = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();

    $fullname = trim($_POST['fullname'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm = $_POST['confirm_password'] ?? '';
    $type = $_POST['account_type'] ?? '';

    if (
        $fullname === '' || $phone === '' ||
        !filter_var($email, FILTER_VALIDATE_EMAIL)
    ) {
        $error = "يرجى إدخال البيانات بصورة صحيحة.";
    } elseif (strlen($password) < 8) {
        $error = "كلمة المرور يجب أن تكون 8 أحرف على الأقل.";
    } elseif ($password !== $confirm) {
        $error = "كلمتا المرور غير متطابقتين.";
    } elseif (!in_array($type, ['buyer', 'seller', 'both'], true)) {
        $error = "اختر نوع الحساب.";
    } elseif (empty($_POST['terms'])) {
        $error = "يجب الموافقة على الشروط.";
    } else {
        $check = $pdo->prepare(
            "SELECT id FROM users WHERE email = ?"
        );
        $check->execute([$email]);

        if ($check->fetch()) {
            $error = "هذا البريد مسجل بالفعل.";
        } else {
            $hashedPassword = password_hash(
                $password,
                PASSWORD_DEFAULT
            );

            $stmt = $pdo->prepare(
                "INSERT INTO users
                (fullname, email, phone, password, account_type)
                VALUES (?, ?, ?, ?, ?)"
            );

            $stmt->execute([
                $fullname,
                $email,
                $phone,
                $hashedPassword,
                $type
            ]);

            $success = "تم إنشاء الحساب بنجاح. يمكنك تسجيل الدخول الآن.";
        }
    }
}
?>
