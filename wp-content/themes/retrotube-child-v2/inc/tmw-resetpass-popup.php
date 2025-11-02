<?php
if (!defined('ABSPATH')) exit;

/**
 * TMW Reset Password — Popup AJAX bridge (Theme My Login compatible)
 * - Validates key/login with check_password_reset_key()
 * - Resets password securely with reset_password()
 */
final class TMW_ResetPass_Popup {
    const TAG = '[TMW-RP]';
    const NONCE = 'tmw-resetpass';

    public static function boot() {
        add_action('wp_ajax_nopriv_tmw_tml_do_resetpass', [__CLASS__, 'ajax_do_resetpass']);
        add_action('wp_ajax_tmw_tml_do_resetpass',         [__CLASS__, 'ajax_do_resetpass']);
    }

    public static function ajax_do_resetpass() {
        // Basic CSRF
        $nonce = isset($_POST['nonce']) ? sanitize_text_field(wp_unslash($_POST['nonce'])) : '';
        if (!wp_verify_nonce($nonce, self::NONCE)) {
            wp_send_json_error(['message' => __('Security check failed. Please refresh and try again.', 'wpst')], 400);
        }

        $login = isset($_POST['rp_login']) ? sanitize_user(wp_unslash($_POST['rp_login'])) : '';
        $key   = isset($_POST['rp_key'])   ? sanitize_text_field(wp_unslash($_POST['rp_key'])) : '';
        $p1    = isset($_POST['pass1'])    ? (string) wp_unslash($_POST['pass1']) : '';
        $p2    = isset($_POST['pass2'])    ? (string) wp_unslash($_POST['pass2']) : '';

        if ($p1 === '' || $p2 === '') {
            wp_send_json_error(['message' => __('Please enter your new password twice.', 'wpst')], 422);
        }
        if ($p1 !== $p2) {
            wp_send_json_error(['message' => __('Passwords do not match.', 'wpst')], 422);
        }
        if ($login === '' || $key === '') {
            wp_send_json_error(['message' => __('Reset link is incomplete. Please request a new link.', 'wpst')], 400);
        }

        if (defined('WP_DEBUG') && WP_DEBUG) error_log(self::TAG . " ajax_do_resetpass: checking key for user '$login'");

        // Validate the key against the login (WP core)
        $user = check_password_reset_key($key, $login);
        if (is_wp_error($user)) {
            $code = $user->get_error_code();
            if (defined('WP_DEBUG') && WP_DEBUG) error_log(self::TAG . " invalid key for '$login' → $code");
            $msg = ($code === 'expired_key')
                ? __('Your password reset link has expired. Please request a new link.', 'wpst')
                : __('Invalid reset key. Please request a new link.', 'wpst');
            wp_send_json_error(['message' => $msg], 400);
        }

        // Strength validation is optional; rely on WP defaults/policy
        reset_password($user, $p1);

        if (defined('WP_DEBUG') && WP_DEBUG) error_log(self::TAG . " password reset OK for user '$login'");

        wp_send_json_success([
            'message' => __('Your password has been reset.', 'wpst'),
        ]);
    }
}

TMW_ResetPass_Popup::boot();
