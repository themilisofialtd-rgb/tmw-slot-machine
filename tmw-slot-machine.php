<?php
/*
Plugin Name: TMW Slot Machine
Description: Interactive slot bonus banner for Top-Models.Webcam
Version: 1.4.8
Author: The Milisofia Ltd
*/

if (!defined('ABSPATH')) {
    exit;
}

define('TMW_SLOT_MACHINE_PATH', plugin_dir_path(__FILE__));
define('TMW_SLOT_MACHINE_URL', plugin_dir_url(__FILE__));

if (!defined('TMW_SLOT_MACHINE_DEFAULT_HEADLINE')) {
    define('TMW_SLOT_MACHINE_DEFAULT_HEADLINE', 'Spin Now & Reveal Your Secret Bonus 👀');
}

// Verify that all neon icon files exist
add_action('init', function() {
    $icons = ['bonus.png', 'peeks.png', 'deal.png', 'roses.png', 'value.png'];
    $missing = [];
    foreach ($icons as $icon) {
        $path = TMW_SLOT_MACHINE_PATH . 'assets/img/' . $icon;
        if (!file_exists($path)) {
            $missing[] = $icon;
        }
    }
    if (!empty($missing)) {
        error_log('[TMW Slot Machine] Missing icons: ' . implode(', ', $missing));
    }
});

function tmw_slot_machine_asset_version($relative_path) {
    $path = TMW_SLOT_MACHINE_PATH . ltrim($relative_path, '/');
    return file_exists($path) ? filemtime($path) : false;
}

add_action('wp_enqueue_scripts', function () {
    if (is_admin()) {
        return;
    }

    if (!is_singular('model')) {
        return;
    }

    $base = plugins_url('assets/', __FILE__);

    // CSS (canonical)
    wp_register_style(
        'tmw-slot-css',
        $base . 'css/slot-machine.css',
        [],
        '1.1.6g'
    );
    wp_enqueue_style('tmw-slot-css');

    // JS (footer, after DOM, avoids early race with AO)
    wp_register_script(
        'tmw-slot-js',
        $base . 'js/slot-machine.js',
        [],
        '1.1.6g',
        true
    );
    wp_enqueue_script('tmw-slot-js');

    $settings        = get_option('tmw_slot_machine_settings', []);
    $win_probability = isset($settings['win_rate']) ? (int) $settings['win_rate'] : 50;
    $win_probability = max(0, min(100, $win_probability));

    $offers = get_option('tmw_slot_machine_offers', []);
    if (empty($offers) && !empty($settings['offers'])) {
        $offers = $settings['offers'];
    }

    $headline = get_option('tmw_slot_trigger_headline', TMW_SLOT_MACHINE_DEFAULT_HEADLINE);
    if (!is_string($headline) || $headline === '') {
        $headline = TMW_SLOT_MACHINE_DEFAULT_HEADLINE;
    }

    wp_localize_script('tmw-slot-js', 'tmwSlot', [
        'url'       => plugins_url('', __FILE__),
        'assetsUrl' => plugins_url('assets', __FILE__),
        'winRate'   => $win_probability,
        'offers'    => is_array($offers) ? array_values($offers) : [],
        'headline'  => wp_strip_all_tags($headline),
    ]);
}, 99);

// Register shortcode
add_shortcode('tmw_slot_machine', 'tmw_slot_machine_display');
function tmw_slot_machine_display() {
    ob_start();
    include TMW_SLOT_MACHINE_PATH . 'templates/slot-machine-display.php';
    return ob_get_clean();
}

// Admin menu
add_action('admin_menu', function() {
    add_options_page('TMW Slot Machine', 'TMW Slot Machine', 'manage_options', 'tmw-slot-machine', 'tmw_slot_machine_admin_page');
});

add_action('admin_init', function() {
    register_setting(
        'tmw_slot_machine_group',
        'tmw_slot_trigger_headline',
        [
            'type'              => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default'           => TMW_SLOT_MACHINE_DEFAULT_HEADLINE,
        ]
    );
});

function tmw_slot_machine_admin_page() {
    include TMW_SLOT_MACHINE_PATH . 'admin/settings-page.php';
}

// Activation hook
register_activation_hook(__FILE__, function() {
    $default_settings = [
        'win_rate'     => 20,
        'sound'        => 'off',
        'accent_color' => '#ff003c',
        'offers'       => [
            ['title' => '70% OFF Welcome Bonus', 'url' => 'https://www.livejasmin.com/en/promotions?category=girls&psid=Topmodels4u'],
            ['title' => '10 Free Peeks', 'url' => 'https://www.livejasmin.com/en/promotions?category=girls&psid=Topmodels4u'],
            ['title' => 'Hot Deal: Private Shows', 'url' => 'https://www.livejasmin.com/en/promotions?category=girls&psid=Topmodels4u'],
            ['title' => '15% OFF Million Roses', 'url' => 'https://www.livejasmin.com/en/promotions?category=girls&psid=Topmodels4u'],
            ['title' => 'Best Value – From 0.01 Credits', 'url' => 'https://www.livejasmin.com/en/promotions?category=girls&psid=Topmodels4u'],
        ],
    ];

    $existing = get_option('tmw_slot_machine_settings');

    if (!$existing) {
        update_option('tmw_slot_machine_settings', $default_settings);
    } else {
        update_option('tmw_slot_machine_settings', wp_parse_args($existing, $default_settings));
    }

    if (get_option('tmw_slot_trigger_headline', false) === false) {
        update_option('tmw_slot_trigger_headline', TMW_SLOT_MACHINE_DEFAULT_HEADLINE);
    }
});
