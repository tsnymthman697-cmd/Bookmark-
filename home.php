<?php
require_once 'includes/functions.php';
require_login();

$user = current_user();

$stmt = $pdo->query(
    "SELECT books.*, users.fullname AS seller
     FROM books
     JOIN users ON books.user_id = users.id
     WHERE books.status = 'available'
     ORDER BY books.created_at DESC"
);

$books = $stmt->fetchAll();
?>

