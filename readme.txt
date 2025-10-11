=== TMW Slot Machine ===
Contributors: adultwebmaster69
Tags: slot machine, gamification, affiliate, livejasmin
Requires at least: 5.0
Tested up to: 6.4
Stable tag: 1.1.3c
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

A gamified "Spin & Win" slot machine for LiveJasmin affiliate promotions. Control win probability, branding, color accents, sound defaults, and featured offers to boost conversions.

== Description ==
TMW Slot Machine delivers a dopamine-driven engagement loop to promote LiveJasmin offers via a fun slot machine widget. Customize win rate, sound defaults, highlight color, and the LiveJasmin offers promoted from the WordPress admin panel.

Use the `[tmw_slot_machine]` shortcode to display the slot machine anywhere on your site. The default win probability is 20%, and sound remains muted until users enable it manually.

== Installation ==
1. Upload the `tmw-slot-machine` folder to the `/wp-content/plugins/` directory.
2. Activate the plugin through the 'Plugins' menu in WordPress.
3. Configure offers, win probability, accent color, and sound defaults under **Settings → TMW Slot Machine**.
4. Insert the `[tmw_slot_machine]` shortcode into any post or page.

== Frequently Asked Questions ==
= Can I change the win chance? =
Yes. Adjust the percentage on the settings page to tune the win frequency.

= How are offers managed? =
Default offers are preloaded on activation. Update the offers table from the settings screen to rotate new promotions.

== Changelog ==
= 1.1.3c =
* Neutralized legacy red text colors so titles, prizes, and win messages inherit the global white styling while preserving button accents.

= 1.1.3b =
* Forced all slot machine UI text to pure white for consistent contrast across promotional and result messaging.

= 1.1.3 =
* Locked the UI layout so the left button always stays "Spin" focused while the claim CTA renders exclusively on the right column.
* Added DOM hygiene watchdogs to remove ghost `.tmw-claim-bonus` links and duplicate slot buttons during async transitions.
* Scoped CSS visibility so any misplaced claim CTA stays hidden outside the `.slot-right` panel.
* Simplified spin/reset button logic to remove unused claim-handling branches and prep for future promos.

= 1.0.0 =
* Initial release of the TMW Slot Machine with configurable win probability, featured offers, accent color, sound toggle, and shortcode display.

== Upgrade Notice ==
= 1.1.3c =
Text-only visual cleanup — removes lingering red text declarations so the slot experience stays uniformly white without changing CTA/button colors.

= 1.1.3b =
Visual polish release — refresh to ensure every slot machine headline, prompt, and win message renders in high-contrast white text.

= 1.1.3 =
Finalized the stable spin/claim layout — update to stop duplicate "Claim Your Bonus" buttons and keep the CTA anchored on the right column.

= 1.0.0 =
Initial release.
