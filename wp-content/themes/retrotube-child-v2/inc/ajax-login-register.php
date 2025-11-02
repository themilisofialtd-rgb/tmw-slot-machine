<?php
if (!defined('ABSPATH')) exit;
?>
<?php /* === Popup: Reset Password (hidden by default) === */ ?>
<div id="wpst-resetpass-panel" class="wpst-modal-panel" style="display:none;">
    <h3><?php esc_html_e('Reset Password', 'wpst'); ?></h3>

    <form id="wpst-resetpass-form" autocomplete="off">
        <div class="form-group">
            <label for="wpst-rp-pass1"><?php esc_html_e('New password', 'wpst'); ?></label>
            <input type="password" id="wpst-rp-pass1" name="pass1" class="form-control" required />
        </div>

        <div class="form-group">
            <label for="wpst-rp-pass2"><?php esc_html_e('Confirm new password', 'wpst'); ?></label>
            <input type="password" id="wpst-rp-pass2" name="pass2" class="form-control" required />
        </div>

        <input type="hidden" id="wpst-rp-login" name="rp_login" value="" />
        <input type="hidden" id="wpst-rp-key"   name="rp_key"   value="" />
        <input type="hidden" id="wpst-rp-nonce" name="nonce"    value="<?php echo esc_attr( wp_create_nonce('tmw-resetpass') ); ?>" />

        <button type="submit" class="btn btn-theme btn-lg">
            <?php esc_html_e('Save Password', 'wpst'); ?>
        </button>

        <div id="wpst-resetpass-msg" class="alert" style="display:none;"></div>
    </form>
</div>
