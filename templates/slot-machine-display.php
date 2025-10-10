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
  <div class="slot-body">
    <div class="slot-left">
      <button id="tmw-slot-btn" class="tmw-spin-btn slot-spin slot-btn" type="button">
        <span class="slot-label">SPIN NOW</span>
        <span class="slot-icon">🎰</span>
      </button>
    </div>

    <div class="slot-center">
      <div class="tmw-reels slot-reels">
        <div class="reel"></div>
        <div class="reel"></div>
        <div class="reel"></div>
      </div>
    </div>

    <div class="slot-right">
      <div class="tmw-result slot-result"></div>
      <div class="tmw-sound-toggle slot-sound-toggle">🔊 Sound On</div>
    </div>
  </div>
</div>
