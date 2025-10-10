<?php
$settings = get_option('tmw_slot_machine_settings', []);
$win_rate = $settings['win_rate'] ?? 20;
$sound_default = $settings['sound'] ?? 'off';
$accent_color = $settings['accent_color'] ?? '#ff003c';
$offers = $settings['offers'] ?? [];
$offers_json = esc_attr(wp_json_encode($offers));
?>
<div class="tmw-slot-machine" data-win-rate="<?php echo esc_attr($win_rate); ?>" data-sound-default="<?php echo esc_attr($sound_default); ?>" data-offers="<?php echo $offers_json; ?>" style="--tmw-accent-color: <?php echo esc_attr($accent_color); ?>;">
  <div class="slot-headline">Spin Now &amp; Reveal Your Secret Bonus 👀</div>
  <div class="tmw-reels">
    <div class="reel"></div>
    <div class="reel"></div>
    <div class="reel"></div>
  </div>
  <button class="tmw-spin-btn">SPIN NOW 🎰</button>
  <div class="tmw-result"></div>
  <div class="tmw-sound-toggle">🔇 Enable Sound</div>
</div>
