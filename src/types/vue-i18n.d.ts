import { ComponentCustomProperties } from 'vue';
import { Composer } from 'vue-i18n';

declare module 'vue' {
  interface ComponentCustomProperties {
    $t: Composer['t'];
  }
}
