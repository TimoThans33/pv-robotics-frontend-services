<template>
  <main>
    <NavBanner />
    <Toast/>
    <router-view />
  </main>
</template>

<script lang="ts">
import { defineComponent } from "vue";

import NavBanner from "@/pv/components/nav-banner.vue";
import Toast from 'primevue/toast';

export default defineComponent({
  components: {
    NavBanner,
    Toast,
  }
});
</script>

<style lang="scss">
@import "~@/pv/styles/variables.scss";
@import "~@/pv/styles/icons.scss";
@import "~@/pv/styles/fonts.scss";
@import "~@/pv/styles/theme.css";




html, body {
  width: 100%;
  height: 100%;
  margin: 0;

  // overflow: hidden;
  font-family: "Open Sans";
}

.shadow {
    -webkit-box-shadow: 0px 0px 8px -2px rgba(0,0,0,0.28); 
  box-shadow: 0px 0px 8px -2px rgba(0,0,0,0.28);
}

.radius {
  border-radius: 5px;
}

.component {
  background: white;
  border-radius: 5px;
    -webkit-box-shadow: 0px 0px 8px -2px rgba(0,0,0,0.28); 
  box-shadow: 0px 0px 8px -2px rgba(0,0,0,0.28);
  overflow: hidden;
  border-top: 6px solid var(--surface-800);

  // & > * {
  //   border-top: 6px solid var(--surface-800);
  // }

}

.component:first-of-type{
  margin-bottom: $spacer-3;
}


main {
  height: inherit;
  display: grid;
  justify-content: flex-start;
  background: var(--surface-200);
  grid-template-rows: minmax(0, min-content) minmax(0, auto);
  grid-template-columns: min-content 1fr;
}

nav {
  grid-column: 1 / 3;
}

aside {
  flex-shrink: 0;
  grid-row: 2;
  // height: 100%;
  background: var(--surface-900);
}

.p-inputtext.p-invalid:enabled:focus {
  box-shadow: 0 0 0 0.2rem #e515154b;
}

.p-button {
  font-weight: bold !important;
}

</style>
