<?php
// One-time setup script: creates the database and tables from schema.sql
// using the credentials in config.php. Run with: php api/setup_database.php

$config = require __DIR__ . '/config.php';

$dsn = sprintf('mysql:host=%s;port=%s;charset=utf8mb4', $config['host'], $config['port']);

try {
    $pdo = new PDO($dsn, $config['username'], $config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
} catch (Throwable $e) {
    fwrite(STDERR, "Could not connect to MySQL: " . $e->getMessage() . PHP_EOL);
    exit(1);
}

$sql = file_get_contents(__DIR__ . '/schema.sql');
if ($sql === false) {
    fwrite(STDERR, "Could not read schema.sql" . PHP_EOL);
    exit(1);
}

// Split on semicolons that end a statement (schema.sql has no semicolons inside strings).
$statements = array_filter(array_map('trim', explode(';', $sql)));

$executed = 0;
foreach ($statements as $statement) {
    if ($statement === '') continue;
    try {
        $pdo->exec($statement);
        $executed++;
    } catch (Throwable $e) {
        fwrite(STDERR, "Failed on statement: " . substr($statement, 0, 80) . "...\n");
        fwrite(STDERR, $e->getMessage() . PHP_EOL);
        exit(1);
    }
}

echo "Database setup complete. Executed {$executed} statements." . PHP_EOL;
