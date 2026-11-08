<?php
require_once 'includes/functions.php';
require_login();

$search = trim($_GET['q'] ?? '');
$books = [];

if ($search !== '') {
    $stmt = $pdo->prepare(
        "SELECT books.*, users.fullname AS seller
         FROM books
         JOIN users ON books.user_id = users.id
         WHERE books.status = 'available'
         AND (
             books.title LIKE ?
             OR books.author LIKE ?
             OR books.category LIKE ?
         )
         ORDER BY books.created_at DESC"
    );

    $term = "%$search%";
    $stmt->execute([$term, $term, $term]);
    $books = $stmt->fetchAll();
}
?>

