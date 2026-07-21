// Temporary Firefox-only wtr config for local debugging of the CI-only
// Firefox hang in midisynthaudioworklet.spec.js. Not used by CI.
import { playwrightLauncher } from '@web/test-runner-playwright';
import base from './web-test-runner.config.js';

export default {
  ...base,
  browsers: [
    playwrightLauncher({
      product: 'firefox', launchOptions: {
        headless: true,
        firefoxUserPrefs: {
          'media.autoplay.block-webaudio': false,
          'media.autoplay.default': 0,
          'media.autoplay.allow-extension-background-pages': true,
          'media.autoplay.blocking_policy': 0,
          'dom.require_user_interaction_for_audio': false,
          'dom.audiochannel.mutedByDefault': false,
          'dom.webmidi.enabled': true,
          'midi.testing': true,
          'webgl.force-enabled': true,
          'webgl.disabled': false
        }
      }
    }),
  ],
};
