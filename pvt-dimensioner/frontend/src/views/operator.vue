<template>
  <div class="flex flex-column align-items-stretch w-screen p-root root">
    <Menubar :model="menu" class="p-0"> </Menubar>

    <div class="row top-row">
      <div class="column">
        <p>Infeed: {{ scanner_id }}</p>
      </div>
      <div class="column">
        <p>status: {{ infeed_status }}</p>
      </div>
    </div>

    <section style="height: 20%">
      <div>
        <h3 class="smaller">Throughput of this infeed:</h3>
        <p style="margin: 0; font-style: bold">
          {{ throughputThisInfeed }} pph
        </p>
      </div>

      <div>
        <h3 class="smaller">Overall throughput:</h3>
        <p style="margin: 0">{{ throughputAll }} pph</p>
      </div>
    </section>

    <div><h3 style="text-align: center">Previous Package</h3></div>
    <section style="height: 20%">
      <div>
        <h3 class="smaller">Direction</h3>
        <div style="padding: 10px; font-size: 1.2em">
          <ph-sm style="font-size: 1.2em">{{ record.direction }}</ph-sm>
          <p style="margin: 0">
            {{ record.barcode.slice(record.barcode.length - 6) }}
          </p>
        </div>
      </div>
      <div>
        <h3 class="smaller">Robot</h3>
        <ph-sm style="padding: 10px; font-size: 1.5em" class="robot">{{
          record.robot
        }}</ph-sm>
      </div>
    </section>

    <div><h3 style="text-align: center">Current Package</h3></div>
    <section>
      <div>
        <h3>Direction</h3>
        <div class="center">
          <ph class="bottom-row bottom-direction">{{ direction }}</ph>
          <p style="margin: 0">{{ barcode.slice(barcode.length - 6) }}</p>
        </div>
      </div>
      <div>
        <h3>Robot</h3>
        <ph class="bottom-row bottom-robot">{{ robot }}</ph>
      </div>
    </section>
  </div>
</template>
<script >
import Menubar from "primevue/menubar";

export default {
  components: {
    Menubar,
  },

  data() {
    return {
      qb_api: null,
      qb_ds: null,
      sortedPackagesAtThisInfeed: 0,
      sortedPackagesAll: 0,
      throughputThisInfeed: 0,
      throughputAll: 0,
      infeeds: [],
      infeed_id: "",
      infeed_status: "OFF",
      scanner_id: Number.MAX_SAFE_INTEGER.toString(),
      barcode: "",
      direction: "",
      robot: "",
      sort_start_time: 0.0,
      record: { barcode: "", direction: "", robot: "" },

      menu: [
        {
          label: "Select Infeed",
          items: [],
        },
      ],

      hasMenu: false,
    };
  },
  mounted() {
    this.updateDefaultScannerID();
    this.updateInfeed();

    this.$qb_api.subscribe("/qb/ds/update_parcel_queue", (data) => {
      if (data.extra.cell_id != this.infeed_id) return;
      this.record.barcode = this.barcode;
      this.record.robot = this.robot;
      this.record.direction = this.direction;

      this.barcode = data.barcode;
      this.robot = "Waiting for next robot";
      this.direction = data.direction;
    });

    this.$qb_api.subscribe("/qb/ds/piece_to_output", (data) => {
      if (data.extra.input_cell != this.infeed_id) return;
      this.barcode = data.extra.piece_id;
      this.robot = data.extra.robot_id;
      this.direction = data.extra.direction;
    });

    this.$qb_api.subscribe("/qb/logic/mode", (data) => {
      let mode = JSON.parse(data);
      if ("inputs" in mode) {
        for (const [key, value] of Object.entries(mode.inputs)) {
          if (this.infeed_id == `${key}`) {
            this.infeed_status = `${value}` == "true" ? "ON" : "OFF";
            break;
          }
        }
      }
    });

    this.$qb_api.subscribe("/qb/ds/throughput", (data) => {
      this.throughputThisInfeed = data.throughput[this.scanner_id];
      this.throughputAll = data.throughput.total_throughput;
    });

    this.$qb_logic.getSortStartTime().then((res) => {
      this.sort_start_time = parseFloat(res.time);
    });
  },
  methods: {
    resetContext() {
      this.barcode = "";
      this.robot = "";
      this.direction = "";
      this.record.barcode = "";
      this.record.direction = "";
      this.record.robot = "";
      this.throughputThisInfeed = 0;
      this.throughputAll = 0;
      this.sortedPackagesAtThisInfeed = 0;
      this.sortedPackagesAll = 0;
      this.infeeds = [];
    },
    // get the smallest available scaner ID from cellmap as default ID
    updateDefaultScannerID() {
      this.$qb_ds.getCellMap().then((cells) => {
        for (const [key, value] of Object.entries(cells)) {
          if (Number(`${value}`) <= Number(this.scanner_id)) {
            this.scanner_id = `${value}`;
          }
        }
      });
    },
    updateInfeed() {
      console.log("update infeed");
      this.$qb_ds.getCellMap().then((cells) => {
        for (const [key, value] of Object.entries(cells)) {
          if (`${value}` == this.scanner_id) {
            this.infeed_id = `${key}`;
          }
          this.infeeds.push(`${key}`);

          if (!this.hasMenu) {
            let item = {
              label: "Infeed " + `${value}`,
              command: () => {
                this.scanner_id = `${value}`;
                this.updateInfeed();
                this.resetContext();
              },
            };
            this.menu[0].items.push(item);
          }
        }
        this.hasMenu = true;
      });
    },
  },
};
</script>


<style scoped lang="scss">
section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: black;
  gap: 1px;
  border: 1px solid black;
  height: 100%;

  h1 {
    font-size: 2em;
    background: grey;
    border-bottom: 1px solid var(--surface-500);
    margin: {
      top: 5px;
      bottom: 5px;
    }
    width: 100%;
    text-align: center;
    background: var(--surface-400);
  }

  h3 {
    font-size: 1.5em;
    border-bottom: 1px solid var(--surface-500);
    margin: {
      top: 0;
    }
    width: 100%;
    text-align: center;
    background: var(--surface-400);
  }

  div {
    font-size: 1.5em;
    background: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  ph {
    font-size: 2.5em;
  }

  ph-sm {
    font-size: 30px;
  }
}

.column {
  float: left;
  font-size: 2em;
  text-align: center;
  background: lightgray;
  width: 50%;
}

/* Clear floats after the columns */
.row:after {
  content: "";
  display: table;
  clear: both;
}

h3 {
  margin: 0;
  font-size: 1.5em;
}

.p-root {
  font-size: 1.5em;
}

.top-row p {
  margin: 0.3em 0;
}

.smaller {
  font-size: 0.9em;
}

.bottom-row {
  padding: 0;
}

.bottom-robot {
  display: flex;
  height: 100%;
  align-items: center;
  font-size: 4.2em;
}

.root {
  height: calc(100% - 50px) !important;
}

.robot {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.center {
  font-size: 2em;
  margin: {
    top: auto;
    bottom: auto;
  }
  display: flex;
  align-items: center;
}
</style>

