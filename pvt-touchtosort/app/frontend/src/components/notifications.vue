<template>
  <DataTable
    :value="store.notifications.slice().reverse()"
    v-model:expandedRows="expandedRows"
    responsiveLayout="scroll"
    class="p-datatable-md w-full notification-table"
  >
    <Column :expander="true" headerStyle="width: 1rem" class="expander" />

    <Column field="severity" headerStyle="width: 1rem" class="badge">
      <template #body="slotProps">
        <Badge
          value=" ! "
          :severity="formatSeverity(slotProps.data.severity)"
        ></Badge>
      </template>
    </Column>

    <Column
      field="title"
      header="Event"
      style="font-size: 1.5em !important"
    ></Column>
    <Column field="time" header="Time" style="font-size: 1.5em !important">
      <template #body="slotProps">
        {{ formatTime(slotProps.data.time, slotProps.data.current_time) }}
      </template>
    </Column>

    <template #expansion="slotProps">
      <div style="padding: 1rem">
        <DataTable
          :value="slotProps.data.description"
          responsiveLayout="scroll"
        >
          <Column
            field="problem"
            header="Problem"
            style="font-size: 1.3em !important"
          ></Column>
          <Column
            field="solution"
            header="Solution"
            style="font-size: 1.3em !important"
          ></Column>
        </DataTable>
      </div>
    </template>
  </DataTable>
</template>

<script >
import { ref, computed } from "vue";
import { useMainStore } from "@/stores/main";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ColumnGroup from "primevue/columngroup"; //optional for column grouping
import Row from "primevue/row"; //optional for row
import Button from "primevue/button";
import Badge from "primevue/badge";

// let robin;

export default {
  components: {
    DataTable,
    Column,
    Badge,
    // Button
  },
  setup() {
    const store = useMainStore();
    const expandedRows = ref([]);

    return {
      store,
      expandedRows,
    };
  },
  data() {
    return {
      metadata: "",
    };
  },
  mounted() {
    setInterval(() => {
      const currentDateTime = new Date().getTime();
      this.store.notifications.forEach((not, index) => {
        not.current_time = currentDateTime;
      });
    }, 5000);
  },
  methods: {
    formatTime: function (time, currentDateTime) {
      const dt = (currentDateTime - time) / 1000; // to seconds

      if (dt <= 60) {
        return `${Math.round(dt)} sec ago`;
      } else if (dt < 3600) {
        return `${Math.floor(dt / 60)} min ago`;
      } else {
        const date = new Date(time);
        const logDate =
          date.getFullYear() +
          "-" +
          (date.getMonth() + 1) +
          "-" +
          date.getDate();
        const logTime =
          date.getHours() + ":" + (date.getMinutes() < 10 ? "0" : "" ) + date.getMinutes() + ":" + (date.getSeconds() < 10 ? "0" : "" ) + date.getSeconds();
        const currentData =
          new Date(currentDateTime).getFullYear() +
          "-" +
          (new Date(currentDateTime).getMonth() + 1) +
          "-" +
          new Date(currentDateTime).getDate();
        return logDate == currentData ? `${logTime}` : `${logTime} ${logDate}`;
      }
    },
    formatSeverity: function (severity) {
      if (severity == 0) return "success";
      else if (severity <= 2) return "warning";
      else return "danger";
    },
  },
};
</script>


<style scoped>
::v-deep(.expander) {
  padding-left: 0.5rem !important;
  padding-right: 0 !important;
}

::v-deep(.badge) {
  padding-left: 0.5rem !important;
  padding-right: 0 !important;
}
::v-deep(.p-datatable-wrapper) {
  width: 100% !important;
}

</style>

