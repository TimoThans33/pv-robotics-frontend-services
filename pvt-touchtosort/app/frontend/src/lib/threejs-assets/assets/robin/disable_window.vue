<template>
  <div>
<Dialog
      header="Disable"
      v-model:visible="visible"
      :style="{ width: '30vw' }"
      maximizable
      :contentStyle="{ height: '110px' }"
      class="p-fluid"
    >

    <span>
      Are you sure you want to disable robot {{this.info.data.id}} ?
    </span>

    <div class="w3-row">
      <div class="w3-col m6" style="padding:8px;">
        <Button type="button" style="width:80px" class="p-button-raised" label="Cancel" @click="cancel" />
      </div>

      <div class="w3-col m6" style="padding:8px;">
        <Button type="button" style="width:80px" class="p-button-raised p-button-danger" label="Disable" @click="disable" />        
      </div>
  </div>
</Dialog>
  </div>

  
</template>

<script>
import { useMainStore } from "@/stores/main";
import Button from 'primevue/button';
import Dialog from "primevue/dialog";

export default {
  components: {
    Button,
    Dialog,
  },
  data() {
    return {
      info: null,
      visible: false,
    };
  },

  mounted() {
    this.store.$subscribe((mutation, state) => {
      this.visible = state.disable_window_visible;
    })
  },

  setup() {
    const store = useMainStore();
    return {
      store,
    };
  },

  methods: {
      cancel(){
        this.store.ToggleDisableWindow();
      },
      disable(){
        let func = this.store.getDisableFunc();
        func();
        this.store.ToggleDisableWindow();
      },
  },

  watch: {
    visible(newVisible, oldVisible) {
      this.store.disable_window_visible = newVisible;
      this.info = this.store.getDisableInfo();
    }
  }
};
</script>