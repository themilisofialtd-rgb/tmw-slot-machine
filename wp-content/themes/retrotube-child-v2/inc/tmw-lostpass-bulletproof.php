<?php
if (!defined('ABSPATH')) exit;

// Normalize the reset URL in emails so it matches TML slugs and working param order.
add_filter('retrieve_password_message', function($message, $key, $user_login){
    // Try to honor TML slugs if present; otherwise default to core.
    $home = home_url('/');
    $reset_slug = 'resetpass'; // TML default
    $lang = function_exists('determine_locale') ? determine_locale() : get_locale();

    $url = add_query_arg([
        'login'   => rawurlencode($user_login),
        'key'     => $key,
        'wp_lang' => $lang,
    ], trailingslashit($home . $reset_slug));

    // Replace any core login.php URL in the message with our normalized pretty URL.
    $message = preg_replace('#https?://[^\s<>()"]+wp-login\.php\?[^\s<>()"]+#', $url, $message);

    if (defined('WP_DEBUG') && WP_DEBUG) error_log('[TMW-RP] inject reset url → ' . $url);
    return $message;
}, 10, 3);
