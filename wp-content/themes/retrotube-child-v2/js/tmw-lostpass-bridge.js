(function(){
  function q(name){ return new URLSearchParams(window.location.search).get(name); }
  function hasResetParams(){
    return (!!q('key') && !!q('login')) || /action=rp/.test(window.location.search);
  }
  function openPanel(id){
    // Open the main modal if your theme requires a trigger; fall back to direct show
    var panel = document.getElementById(id);
    if (!panel) return;
    // Hide sibling panels (login/register/lost)
    document.querySelectorAll('.wpst-modal-panel').forEach(function(p){ p.style.display = 'none'; });
    panel.style.display = '';
    // If the theme uses a wrapper modal container, ensure it is visible (usually already is)
    var modal = document.querySelector('.wpst-modal, .modal, .login-modal, #login-register-popup');
    if (modal) modal.style.display = '';
  }

  function flashMessage(el, text, ok){
    el.style.display = '';
    el.className = 'alert ' + (ok ? 'alert-success' : 'alert-danger');
    el.textContent = text;
  }

  // 1) If we landed on /resetpass/?login=...&key=... open the popup reset panel
  document.addEventListener('DOMContentLoaded', function(){
    if (hasResetParams()) {
      var login = q('login') || '';
      var key   = q('key')   || '';

      // Prefill hidden fields
      var fLogin = document.getElementById('wpst-rp-login');
      var fKey   = document.getElementById('wpst-rp-key');
      if (fLogin) fLogin.value = login;
      if (fKey)   fKey.value   = key;

      openPanel('wpst-resetpass-panel');
    }

    // 2) If we have ?resetpass=complete open Login with a success flash
    if (new URLSearchParams(window.location.search).get('resetpass') === 'complete') {
      // Try to open login panel if your popup uses IDs; otherwise do nothing
      openPanel('wpst-login-panel'); // falls back silently if not found
      var slot = document.getElementById('wpst-login-msg') || document.getElementById('wpst-resetpass-msg');
      if (slot) flashMessage(slot, 'Your password has been reset. You can now log in.', true);
    }

    // 3) Hook submit for the reset form to do AJAX
    var form = document.getElementById('wpst-resetpass-form');
    if (form) {
      form.addEventListener('submit', function(ev){
        ev.preventDefault();
        var pass1 = document.getElementById('wpst-rp-pass1').value;
        var pass2 = document.getElementById('wpst-rp-pass2').value;
        var login = document.getElementById('wpst-rp-login').value;
        var key   = document.getElementById('wpst-rp-key').value;
        var nonce = document.getElementById('wpst-rp-nonce').value;
        var msgEl = document.getElementById('wpst-resetpass-msg');

        var payload = new FormData();
        payload.append('action','tmw_tml_do_resetpass');
        payload.append('pass1', pass1);
        payload.append('pass2', pass2);
        payload.append('rp_login', login);
        payload.append('rp_key', key);
        payload.append('nonce', nonce);

        fetch((window.tmwAjaxUrl || window.ajaxurl || '/wp-admin/admin-ajax.php'), {
          method: 'POST',
          credentials: 'same-origin',
          body: payload
        }).then(function(r){ return r.json(); })
          .then(function(res){
            if (res && res.success) {
              flashMessage(msgEl, res.data && res.data.message ? res.data.message : 'Password updated.', true);
              // After success, move to Login panel so user can sign in (keep popup UX)
              setTimeout(function(){
                openPanel('wpst-login-panel');
                var slot = document.getElementById('wpst-login-msg') || msgEl;
                if (slot) flashMessage(slot, 'Your password has been reset. You can now log in.', true);
                // Update URL to the canonical success indicator (no reload)
                if (history && history.replaceState) {
                  var u = new URL(window.location.href);
                  u.searchParams.set('resetpass','complete');
                  history.replaceState({}, document.title, u.toString());
                }
              }, 600);
            } else {
              var text = (res && res.data && res.data.message) ? res.data.message : 'Could not reset password.';
              flashMessage(msgEl, text, false);
            }
          }).catch(function(){
            flashMessage(msgEl, 'Network error. Please try again.', false);
          });
      });
    }
  });
})();
