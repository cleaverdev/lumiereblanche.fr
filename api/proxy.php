<?php
/**
 * Lumière Blanche — Proxy API Anthropic
 * Garde la clé API côté serveur, jamais exposée au navigateur
 *
 * ⚠️  SÉCURITÉ :
 *  - Ce fichier doit être sur votre serveur (pas dans un dépôt public)
 *  - Configurez ALLOWED_ORIGIN avec votre vrai domaine en production
 *  - Activez USE_PROXY: true dans js/config.js
 */

// ── Configuration ────────────────────────────────────────────
define('ANTHROPIC_API_KEY', 'YOUR_ANTHROPIC_API_KEY_HERE'); // ← Votre clé
define('ALLOWED_ORIGIN',    'https://lumiereblanche.fr');   // ← Votre domaine
define('MAX_TOKENS',        600);
define('AI_MODEL',          'claude-opus-4-5');
define('RATE_LIMIT_FILE',   sys_get_temp_dir() . '/lb_rate_limit.json');
define('MAX_REQUESTS_PER_IP_PER_HOUR', 10);

// ── CORS ─────────────────────────────────────────────────────
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin === ALLOWED_ORIGIN || (defined('WP_DEBUG') && WP_DEBUG)) {
    header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Méthode non autorisée']);
    exit;
}

// ── Rate limiting par IP ─────────────────────────────────────
function check_rate_limit(): bool {
    $ip   = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $ip   = explode(',', $ip)[0];
    $ip   = trim($ip);
    $data = [];

    if (file_exists(RATE_LIMIT_FILE)) {
        $raw  = file_get_contents(RATE_LIMIT_FILE);
        $data = json_decode($raw, true) ?: [];
    }

    $now      = time();
    $hour_ago = $now - 3600;

    // Purge old entries
    $data = array_filter($data, fn($t) => $t > $hour_ago);

    $ip_requests = count(array_filter($data, fn($t) => isset($t['ip']) && $t['ip'] === $ip));
    if ($ip_requests >= MAX_REQUESTS_PER_IP_PER_HOUR) {
        return false;
    }

    $data[] = ['ip' => $ip, 't' => $now];
    file_put_contents(RATE_LIMIT_FILE, json_encode($data), LOCK_EX);
    return true;
}

if (!check_rate_limit()) {
    http_response_code(429);
    echo json_encode(['error' => 'Trop de requêtes. Réessayez dans une heure.']);
    exit;
}

// ── Lecture du body ──────────────────────────────────────────
$body = file_get_contents('php://input');
$data = json_decode($body, true);

if (!$data || empty($data['prompt'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Requête invalide : prompt manquant']);
    exit;
}

$prompt = trim($data['prompt']);
if (strlen($prompt) > 3000) {
    http_response_code(400);
    echo json_encode(['error' => 'Prompt trop long']);
    exit;
}

// ── Appel Anthropic ──────────────────────────────────────────
$payload = json_encode([
    'model'      => AI_MODEL,
    'max_tokens' => MAX_TOKENS,
    'messages'   => [
        ['role' => 'user', 'content' => $prompt],
    ],
]);

$ch = curl_init('https://api.anthropic.com/v1/messages');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_TIMEOUT        => 30,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'x-api-key: ' . ANTHROPIC_API_KEY,
        'anthropic-version: 2023-06-01',
    ],
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
curl_close($ch);

if ($curl_error) {
    http_response_code(502);
    echo json_encode(['error' => 'Erreur réseau : ' . $curl_error]);
    exit;
}

$api_data = json_decode($response, true);

if ($http_code !== 200 || empty($api_data['content'][0]['text'])) {
    http_response_code(502);
    $msg = $api_data['error']['message'] ?? 'Erreur API inconnue';
    echo json_encode(['error' => $msg]);
    exit;
}

// ── Réponse ──────────────────────────────────────────────────
echo json_encode([
    'text'  => $api_data['content'][0]['text'],
    'model' => $api_data['model'] ?? AI_MODEL,
]);
