<template>
  <div>
    <Dialog
      header="Node Info"
      v-model:visible="visible"
      :style="{ width: '36vw' }"
      maximizable
      :contentStyle="{ height: '330px' }"
      class="p-fluid"
    >
      <TreeTable :value="node" responsiveLayout="scroll">
        <Column field="name" header="Name"></Column>
        <Column field="value" header="Value">
          <template #body="{ node }">
            <span v-if="node.data.value === ''">
              None
            </span>
            <span v-else>
              {{node.data.value}}
            </span>
          </template>
        </Column>
        <Column headerStyle="width: 8em" bodyStyle="text-align: center">
        </Column>
      </TreeTable>
    </Dialog>
  </div>
</template>

<script>
import { useMainStore } from "@/stores/main";
import TreeTable from "primevue/treetable";
import Column from "primevue/column";
import Tree from "primevue/tree";
import Dialog from "primevue/dialog";

export default {
  components: {
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
      this.visible = state.node_window_visible;
    });
  },

  setup() {
    const store = useMainStore();
    return {
      store,
    };
  },

  watch: {
    visible(newVisible, oldVisible) {
      this.store.node_window_visible = newVisible;
      this.node = this.store.getNodeInfo();
    },
  },
};
</script>