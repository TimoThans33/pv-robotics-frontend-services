<template>
  <div>
    <Dialog
      header="Input Node Info"
      v-model:visible="visible"
      :style="{ width: '34vw' }"
      maximizable
      :contentStyle="{ height: '300px' }"
      class="p-fluid"
    >
      <TreeTable :value="node" responsiveLayout="scroll">
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
            label="Enable"
            @click="enable"
          />
        </div>

        <div class="w3-col m3" style="padding: 8px">
          <Button
            type="button"
            icon="pi pi-ban"
            class="p-button-raised p-button-danger"
            label="Disable"
            @click="disable"
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

export default {
  components: {
    Button,
    Dialog,
    TreeTable,
    Column,
  },
  data() {
    return {
      node: null,
      visible: false,
    };
  },

  // created() {
  // },
  mounted() {
    this.store.$subscribe((mutation, state) => {
      this.visible = state.input_node_window_visible;
    });
  },

  setup() {
    const store = useMainStore();
    return {
      store,
    };
  },

  methods: {
    enable() {
      let node = this.node[0].data.value;
      this.$qb_logic.enableInput(node);
    },
    disable() {
      let node = this.node[0].data.value;
      this.$qb_logic.disableInput(node);
    },
  },

  watch: {
    visible(newVisible, oldVisible) {
      this.store.input_node_window_visible = newVisible;
      this.node = this.store.getInputNodeInfo();
    },
  },
};
</script>