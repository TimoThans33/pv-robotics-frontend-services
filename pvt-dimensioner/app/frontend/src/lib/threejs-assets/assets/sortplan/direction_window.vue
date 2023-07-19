<template>
  <div>
    <Dialog
      header="Direction Info"
      v-model:visible="visible"
      :style="{ width: '34vw' }"
      maximizable
      :contentStyle="{ height: '300px' }"
      class="p-fluid"
    >
      <TreeTable :value="info" responsiveLayout="scroll">
        <Column field="name" header="Name" :expander="true"></Column>
        <Column field="value" header="Value"></Column>
        <Column headerStyle="width: 8em" bodyStyle="text-align: center">
        </Column>
      </TreeTable>

      <div class="w3-row">
        <div class="w3-col m3" style="padding: 8px">
          <Button
            type="button"
            icon="pi pi-play"
            class="p-button-raised p-button-success"
            label="Clear"
            @click="clear"
          />
        </div>

        <div class="w3-col m3" style="padding: 8px">
          <Button
            type="button"
            icon="pi pi-ban"
            class="p-button-raised p-button-danger"
            label="Block"
            @click="block"
          />
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script>
import { useMainStore } from "@/stores/main";
import Button from "primevue/button";
import TreeTable from "primevue/treetable";
import Column from "primevue/column";
import Tree from "primevue/tree";
import Dialog from "primevue/dialog";
import { DropoffBox } from "@/lib/threejs-assets/assets/sortplan/dropoff-box"

export default {
  components: {
    Button,
    Dialog,
    TreeTable,
    Column,
  },
  data() {
    return {
      direction: null,
      info: null,
      visible: false,
    };
  },

    // created() {
  // },
  mounted() {
    this.store.$subscribe((mutation, state) => {
      this.visible = state.direction_window_visible;
    });
  },

  setup() {
    const store = useMainStore();
    return {
      store,
    };
  },

  methods: {
    clear() {
        let func = this.store.getClearFunc();
        func();
    },
    block() {
        let func = this.store.getBlockFunc();
        func();
    }
  },

  watch: {
    visible(newVisible, oldVisible) {
      this.store.direction_window_visible = newVisible;
      this.info = this.store.getDirectionInfo();
    },
  },
};

</script>