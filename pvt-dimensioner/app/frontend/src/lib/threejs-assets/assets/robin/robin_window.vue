<template>
  <div>
<Dialog
      header="Robot Info"
      v-model:visible="visible"
      :style="{ width: '40vw' }"
      maximizable
      class="p-fluid"
    >
    <TreeTable :value="info">
      <Column field="name" header="Name" :expander="true"></Column>
      <Column field="value" header="Value"></Column>
      <Column headerStyle="width: 8em" bodyStyle="text-align: center"></Column>
    </TreeTable>

  <Accordion>
    <AccordionTab header="Expert">
      <span class="p-buttonset buttonbar" style="padding:8px">
        <Button type="button" icon="pi pi-cloud" style="width:80px" class="p-button-raised" label="zero scale" @click="zeroScale" iconPos="right"/>
        <Button type="button" icon="pi pi-bolt" style="width:80px" class="p-button-raised" label="resolve" @click="resolve" iconPos="right"/>
        <Button type="button" icon="pi pi-history" style="width:80px" class="p-button-raised" label="reset" @click="reset" iconPos="right"/>
      </span>
      <span class="p-buttonset" style="padding:8px">
        <InputNumber style="width:100px" v-model="x" mode="decimal" :minFractionDigits="2" />
        <InputNumber style="width:100px" v-model="y" mode="decimal" :minFractionDigits="2" />
        <InputNumber style="width:100px" v-model="theta" mode="decimal" :minFractionDigits="2" />
        <Button type="button" class="p-button-raised" style="width:80px" label="set position" @click="setPosition"/>
      </span>

    </AccordionTab>
  </Accordion>
</Dialog>
  </div>

  
</template>

<script>
import { useMainStore } from "@/stores/main";
import Button from 'primevue/button';
import TreeTable from 'primevue/treetable';
import Column from 'primevue/column';
import Dialog from "primevue/dialog";
import Accordion from 'primevue/accordion';
import AccordionTab from 'primevue/accordiontab';
import InputNumber from 'primevue/inputnumber';

export default {
  components: {
    Button,
    Dialog,
    TreeTable,
    Column,
    Accordion,
    AccordionTab,
    InputNumber,
  },
  data() {
    return {
      info: null,
      visible: false,
      x: 0.0,
      y: 0.0,
      theta: 0.0
    };
  },

  mounted() {
    this.store.$subscribe((mutation, state) => {
      this.visible = state.robin_window_visible;
    })
  },

  setup() {
    const store = useMainStore();
    return {
      store,
    };
  },

  methods: {
      resolve(){
        this.store.getClient().resolveExceptions();
      },
      reset(){
        this.store.getClient().reset();
      },
      zeroScale(){
        this.store.getClient().zeroScale();
      },
      setPosition(){
        this.store.getClient().setPosition(this.x, this.y, this.theta);
      }

  },

  watch: {
    visible(newVisible, oldVisible) {
      this.store.robin_window_visible = newVisible;
      this.info = this.store.getRobinInfo();
      for (const field of this.info) {
        if (field.key === "WPose") {
          this.x = field.data.value[0];
          this.y = field.data.value[1];
          this.theta = field.data.value[2];
        }
      }
    }
  }
};
</script>

<style>
.buttonbar{
  display: flex;
  gap: 10px;
}
</style>