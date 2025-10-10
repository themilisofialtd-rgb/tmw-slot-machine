<?php
if (!current_user_can('manage_options')) {
    return;
}

$defaults = [
    'win_rate'     => 20,
    'sound'        => 'off',
    'accent_color' => '#ff003c',
    'offers'       => []
];

$settings = wp_parse_args(get_option('tmw_slot_machine_settings', []), $defaults);
$headline_default = defined('TMW_SLOT_MACHINE_DEFAULT_HEADLINE') ? TMW_SLOT_MACHINE_DEFAULT_HEADLINE : 'Spin Now & Reveal Your Secret Bonus 👀';
$trigger_headline = get_option('tmw_slot_trigger_headline', $headline_default);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && check_admin_referer('tmw_slot_machine_save_settings')) {
    $settings['win_rate'] = max(1, min(100, intval($_POST['win_rate'] ?? $settings['win_rate'])));
    $settings['sound']    = sanitize_text_field($_POST['sound'] ?? $settings['sound']);

    $accent_color = sanitize_hex_color($_POST['accent_color'] ?? $settings['accent_color']);
    $settings['accent_color'] = $accent_color ?: $defaults['accent_color'];

    $headline_input = sanitize_text_field($_POST['tmw_slot_trigger_headline'] ?? $trigger_headline);
    if ($headline_input === '') {
        $headline_input = $headline_default;
    }
    update_option('tmw_slot_trigger_headline', $headline_input);

    $trigger_headline = $headline_input;

    $titles = isset($_POST['offers_title']) ? (array) $_POST['offers_title'] : [];
    $urls   = isset($_POST['offers_url']) ? (array) $_POST['offers_url'] : [];

    $offers = [];
    $count  = max(count($titles), count($urls));
    for ($i = 0; $i < $count; $i++) {
        $title = sanitize_text_field($titles[$i] ?? '');
        $url   = esc_url_raw($urls[$i] ?? '');

        if ($title && $url) {
            $offers[] = [
                'title' => $title,
                'url'   => $url,
            ];
        }
    }

    $settings['offers'] = $offers;

    update_option('tmw_slot_machine_settings', $settings);
    echo '<div class="updated"><p>Settings saved!</p></div>';
}
?>
<div class="wrap">
    <h1>🎰 TMW Slot Machine Settings</h1>
    <form method="post">
        <?php wp_nonce_field('tmw_slot_machine_save_settings'); ?>
        <table class="form-table" role="presentation">
            <tr>
                <th scope="row"><label for="tmw-win-rate">Win Probability (%)</label></th>
                <td>
                    <input id="tmw-win-rate" type="number" name="win_rate" value="<?php echo esc_attr($settings['win_rate']); ?>" min="1" max="100">
                </td>
            </tr>
            <tr>
                <th scope="row"><label for="tmw-sound">Sound Default</label></th>
                <td>
                    <select id="tmw-sound" name="sound">
                        <option value="off" <?php selected($settings['sound'], 'off'); ?>>Muted</option>
                        <option value="on" <?php selected($settings['sound'], 'on'); ?>>On</option>
                    </select>
                    <p class="description">Sound is muted until the visitor toggles it on.</p>
                </td>
            </tr>
            <tr>
                <th scope="row"><label for="tmw-accent-color">Accent Color</label></th>
                <td>
                    <input id="tmw-accent-color" type="color" name="accent_color" value="<?php echo esc_attr($settings['accent_color']); ?>">
                    <p class="description">Controls the button and highlight color of the slot machine.</p>
                </td>
            </tr>
            <tr>
                <th scope="row"><label for="tmw-trigger-headline">Trigger Headline</label></th>
                <td>
                    <input id="tmw-trigger-headline" type="text" name="tmw_slot_trigger_headline" value="<?php echo esc_attr($trigger_headline); ?>" style="width:100%;max-width:600px;">
                    <p class="description">This text appears above the slot reels (e.g. “Spin Now &amp; Reveal Your Secret Bonus 👀”).</p>
                </td>
            </tr>
        </table>

        <h2>Featured Offers</h2>
        <p>Add up to five LiveJasmin offers to rotate through in the slot machine results.</p>
        <table class="widefat fixed striped">
            <thead>
                <tr>
                    <th scope="col">Offer Title</th>
                    <th scope="col">Destination URL</th>
                </tr>
            </thead>
            <tbody>
                <?php
                $offers = $settings['offers'];
                $max_offers = max(5, count($offers));
                for ($i = 0; $i < $max_offers; $i++) {
                    $offer_title = $offers[$i]['title'] ?? '';
                    $offer_url   = $offers[$i]['url'] ?? '';
                    ?>
                    <tr>
                        <td>
                            <input type="text" name="offers_title[]" value="<?php echo esc_attr($offer_title); ?>" placeholder="70% OFF Welcome Bonus" class="regular-text">
                        </td>
                        <td>
                            <input type="url" name="offers_url[]" value="<?php echo esc_attr($offer_url); ?>" placeholder="https://www.livejasmin.com/..." class="regular-text">
                        </td>
                    </tr>
                    <?php
                }
                ?>
            </tbody>
        </table>

        <p class="submit">
            <input type="submit" class="button-primary" value="Save Settings">
        </p>
    </form>
</div>
