<?php
/*
Plugin Name: TMW Slot Machine
Description: Gamified LiveJasmin promotions with variable dopamine-based spin logic to boost engagement and conversions.
Version: 1.0.0
Author: Adultwebmaster69 | Top-Models Webcam Studio
Author URI: https://top-models.webcam
*/

if (!defined('ABSPATH')) {
    exit;
}

define('TMW_SLOT_MACHINE_PATH', plugin_dir_path(__FILE__));
define('TMW_SLOT_MACHINE_URL', plugin_dir_url(__FILE__));

function tmw_slot_machine_asset_version($relative_path) {
    $path = TMW_SLOT_MACHINE_PATH . ltrim($relative_path, '/');
    return file_exists($path) ? filemtime($path) : false;
}

function tmw_slot_machine_enqueue_assets() {
    wp_enqueue_style(
        'tmw-slot-css',
        TMW_SLOT_MACHINE_URL . 'assets/css/slot-machine.css',
        [],
        tmw_slot_machine_asset_version('assets/css/slot-machine.css')
    );

    wp_enqueue_script(
        'tmw-slot-js',
        TMW_SLOT_MACHINE_URL . 'assets/js/slot-machine.js',
        [],
        tmw_slot_machine_asset_version('assets/js/slot-machine.js'),
        true
    );
}

// Register shortcode
add_shortcode('tmw_slot_machine', 'tmw_slot_machine_display');
function tmw_slot_machine_display() {
    tmw_slot_machine_enqueue_assets();

    ob_start();
    include TMW_SLOT_MACHINE_PATH . 'templates/slot-machine-display.php';
    return ob_get_clean();
}

// Admin menu
add_action('admin_menu', function() {
    add_options_page('TMW Slot Machine', 'TMW Slot Machine', 'manage_options', 'tmw-slot-machine', 'tmw_slot_machine_admin_page');
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
});
