<?php
require_once 'includes/functions.php';
require_login();

$user = current_user();
$error = "";
$success = "";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    verify_csrf();

    $action = $_POST['action'] ?? '';

    // إضافة كتاب
    if ($action === 'add_book') {
        $title = trim($_POST['title'] ?? '');
        $author = trim($_POST['author'] ?? '');
        $category = trim($_POST['category'] ?? '');
        $price = $_POST['price'] ?? '';
        $condition = $_POST['condition'] ?? '';
        $description = trim($_POST['description'] ?? '');

        if (
            $title === '' || $author === '' ||
            $category === '' || !is_numeric($price) ||
            (float)$price <= 0 ||
            !in_array($condition, ['جديد', 'مستعمل'], true)
        ) {
            $error = "تأكد من إدخال بيانات الكتاب بصورة صحيحة.";
        } else {
            $imagePath = null;

            if (
                isset($_FILES['book_image']) &&
                $_FILES['book_image']['error'] !== UPLOAD_ERR_NO_FILE
            ) {
                if ($_FILES['book_image']['error'] !== UPLOAD_ERR_OK) {
                    $error = "حدث خطأ أثناء رفع الصورة.";
                } elseif ($_FILES['book_image']['size'] > 2 * 1024 * 1024) {
                    $error = "حجم الصورة يجب ألا يتجاوز 2 ميجابايت.";
                } else {
                    $finfo = new finfo(FILEINFO_MIME_TYPE);
                    $mime = $finfo->file($_FILES['book_image']['tmp_name']);

                    $allowed = [
                        'image/jpeg' => 'jpg',
                        'image/png' => 'png',
                        'image/webp' => 'webp'
                    ];

                    if (!isset($allowed[$mime])) {
                        $error = "الصورة يجب أن تكون JPG أو PNG أو WEBP.";
                    } else {
                        $uploadDir = __DIR__ . '/uploads/';

                        if (!is_dir($uploadDir)) {
                            mkdir($uploadDir, 0755, true);
                        }

                        $filename = bin2hex(random_bytes(16))
                            . '.' . $allowed[$mime];

                        if (
                            move_uploaded_file(
                                $_FILES['book_image']['tmp_name'],
                                $uploadDir . $filename
                            )
                        ) {
                            $imagePath = 'uploads/' . $filename;
                        } else {
                            $error = "تعذر حفظ الصورة.";
                        }
                    }
                }
            }

            if ($error === '') {
                $stmt = $pdo->prepare(
                    "INSERT INTO books
                    (user_id, title, author, category, price,
                     book_condition, image, description)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
                );

                $stmt->execute([
                    $user['id'],
                    $title,
                    $author,
                    $category,
                    $price,
                    $condition,
                    $imagePath,
                    $description
                ]);

                $success = "تمت إضافة الكتاب بنجاح.";
            }
        }
    }

    // شراء كتاب
    if ($action === 'buy_book') {
        $bookId = filter_input(INPUT_POST, 'book_id', FILTER_VALIDATE_INT);

        if (!$bookId) {
            $error = "رقم الكتاب غير صحيح.";
        } else {
            try {
                $pdo->beginTransaction();

                $stmt = $pdo->prepare(
                    "SELECT * FROM books
                     WHERE id = ? AND status = 'available'
                     FOR UPDATE"
                );
                $stmt->execute([$bookId]);
                $book = $stmt->fetch();

                if (!$book) {
                    throw new Exception("الكتاب غير متاح للشراء.");
                }

                if ((int)$book['user_id'] === (int)$user['id']) {
                    throw new Exception("لا يمكنك شراء كتابك الخاص.");
                }

                $stmt = $pdo->prepare(
                    "INSERT INTO orders (book_id, buyer_id, seller_id)
                     VALUES (?, ?, ?)"
                );
                $stmt->execute([
                    $bookId,
                    $user['id'],
                    $book['user_id']
                ]);

                $pdo->commit();
                $success = "تم إرسال طلب الشراء بنجاح.";
            } catch (Exception $ex) {
                if ($pdo->inTransaction()) {
                    $pdo->rollBack();
                }
                $error = $ex->getMessage();
            }
        }
    }
}

$stmt = $pdo->query(
    "SELECT books.*, users.fullname AS seller
     FROM books
     JOIN users ON books.user_id = users.id
     WHERE books.status = 'available'
     ORDER BY books.created_at DESC"
);
$books = $stmt->fetchAll();
?>

