<template>
  <router-view />
</template>


<script lang="ts">
  import { defineComponent } from "vue";

  export default defineComponent({

  });
</script>


<style lang="scss">
  // These styles are globally applied 
  @import "pv/styles/icons.scss";
  // @import "pv/styles/fonts.scss";

  @import "pv/styles/theme.css";

  @import "primevue/resources/primevue.min.css";
  @import "primeflex/primeflex.min.css";
  @import "primeicons/primeicons.css";

  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
  }

  body {
    overflow: hidden;
    background: var(--surface-200);
    font-family: "Open Sans";
  }
</style>
