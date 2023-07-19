<template>
  <div class="flex flex-column border-top-1 pb-5">
    <div class="flex justify-content-center">
      <h1 style="font-size: 4vh">{{ store.sorting_mode }}</h1>
    </div>
    <div class="flex">
      <Button
        v-if="!store.sorting_paused"
        class="p-button-outlined p-button-danger"
        @click="pause"
        ><i class="pi pi-pause" style="font-size: 14vh"></i
      ></Button>
      <Button v-else class="p-button-outlined p-button-danger" @click="play"
        ><i class="pi pi-play" style="font-size: 14vh"></i
      ></Button>
    </div>
  </div>
</template>

<script >
import { ref, computed } from "vue";

import Button from "primevue/button";

import { useMainStore } from "@/stores/main";

export default {
  components: {
    Button,
  },
  setup() {
    const store = useMainStore();

    return {
      store,
    };
  },
  data() {
    return {
      qb_logic: null,
    };
  },
  methods: {
    play() {
      this.$qb_logic.play();
    },
    pause() {
      this.$qb_logic.pause();
    },
  },
};
</script>


<style scoped>
</style>

