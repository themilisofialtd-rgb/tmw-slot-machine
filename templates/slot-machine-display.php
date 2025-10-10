<?php
$settings = get_option('tmw_slot_machine_settings', []);
$win_rate = $settings['win_rate'] ?? 20;
$sound_default = $settings['sound'] ?? 'off';
$accent_color = $settings['accent_color'] ?? '#ff003c';
$offers = $settings['offers'] ?? [];
$offers_json = esc_attr(wp_json_encode($offers));
$headline_default = defined('TMW_SLOT_MACHINE_DEFAULT_HEADLINE') ? TMW_SLOT_MACHINE_DEFAULT_HEADLINE : 'Spin Now & Reveal Your Secret Bonus 👀';
$trigger_headline = get_option('tmw_slot_trigger_headline', $headline_default);
if (!is_string($trigger_headline) || $trigger_headline === '') {
    $trigger_headline = $headline_default;
}
?>
<div class="tmw-slot-machine" data-win-rate="<?php echo esc_attr($win_rate); ?>" data-sound-default="<?php echo esc_attr($sound_default); ?>" data-offers="<?php echo $offers_json; ?>" style="--tmw-accent-color: <?php echo esc_attr($accent_color); ?>;">
  <div class="slot-headline"><?php echo esc_html($trigger_headline); ?></div>
  <div class="tmw-reels">
    <div class="reel"></div>
    <div class="reel"></div>
    <div class="reel"></div>
  </div>
  <button class="tmw-spin-btn">SPIN NOW 🎰</button>
  <div class="tmw-result"></div>
  <div class="tmw-sound-toggle">🔇 Enable Sound</div>
</div>
