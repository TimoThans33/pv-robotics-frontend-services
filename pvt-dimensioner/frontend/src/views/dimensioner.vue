<template>
    <div class="flex flex-column align-items-stretch w-screen p-root root">
        <Menubar :model="menu" class="p-0"> </Menubar>
      <div class="row top-row">
        <div class="column">
          <p>Dimensioner: {{ dimensioner_id }}</p>
        </div>
        <div class="column">
          <p>status: {{ dimensioner_status }}</p>  
        </div>
      </div>
      <div><h3 style="text-align: center">Previous Package</h3></div>
      <section style="height: 20%">
      <div>
        <h3 class="smaller">Direction</h3>
        <div style="padding: 10px; font-size: 1.2em">
          <ph-sm style="font-size: 1.2em">{{ record.direction }}</ph-sm>
          <p style="margin: 0">{{ record.barcode.slice(record.barcode.length - 6) }}</p>
        </div>
      </div>
      <div>
        <h3 class="smaller">Weight</h3>
        <ph-sm style="padding: 10px; font-size: 1.5em" class="robot">{{
          record.weight
        }}</ph-sm>
      </div>
      <div>
        <h3 class="smaller">Volume</h3>
        <div style="padding: 10px; font-size: 1.2em">
          <ph-sm style="font-size: 1.2em">{{ record.volume }}</ph-sm>
          <p style="margin: 0">{{ record.length+" X "+record.width+" X "+record.height }}</p>
        </div>
      </div>
      <div>
        <h3 class="smaller">Dimensional Weight</h3>
        <ph-sm style="padding: 10px; font-size: 1.5em">{{ record.dimweight }}</ph-sm>
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
        <h3>Weight</h3>
        <ph class="bottom-row bottom-dim">{{ weight }}</ph>
      </div>
      <div>
        <h3>Volume</h3>
        <div class="center">
          <ph class="bottom-row" style="font-size: 1.5em">{{ volume }}</ph>
          <p style="margin: 0">{{ length+" X "+width+" X "+height }}</p>
        </div>
      </div>
      <div>
        <h3>Dimensional Weight</h3>
        <ph class="bottom-row bottom-dim">{{ dimweight }}</ph>
      </div>
    </section>
    </div>

</template>
<script>
import Menubar from 'primevue/menubar';

export default ({
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
        infeed_id: "0",
        dimensioner_status: "DISCONNECTED",
        dimensioner_id: "0",
        barcode: "",
        direction: "",
        robot: "",

        height: "",
        length: "",
        width: "",
        weight: "",
        
        volume: "",
        dimweight: "",

        sort_start_time: 0.0,
        record: { barcode: "", volume: "", dimweight: "", width: "", height: "", length: "", weight: "" },

        menu: [
          {
            label: "Select Dimensioner",
            items: ["Dimensioner 1", "Dimensioner 2", "Dimensioner 3", "Dimensioner 4"],
          },
          {
            label: "Select Metric",
            items: ["Metric", "Imperial"],
          }
        ],

        hasMenu: true,
        };
    },
    mounted() {
      this.$qb_api.subscribe("/qb/ds/piece_in_tunnel", (data) => {
        this.dimensioner_status = "CONNECTED";

        this.record.barcode = this.barcode;
        this.barcode = data.barcode;

        this.record.direction = this.direction;
        this.direction = data.direction;
        
        this.record.weight = this.weight;        
        this.weight = data.weight + " lbs.";

        this.record.width = this.width;
        this.width = data.dimensions[0] + "″";
        this.record.height = this.height;
        this.height = data.dimensions[1] + "″";
        this.record.length = this.length;
        this.length = data.dimensions[2] + "″";

        this.record.volume = this.volume;
        this.volume = data.volume.toFixed(2) + " cu. in.";

        this.record.dimweight = this.dimweight;
        this.dimweight = data.dimweight.toFixed(2) + " lbs.";
      })
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
    truncateString(str, num) {
      if (str.length <= num) {
        return str;
      }
      return str.slice(0, num);
    }
});
</script>

<style scoped lang="scss">
section {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
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

.bottom-dim {
  display: flex;
  height: 100%;
  align-items: center;
  font-size: 2.5em;
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
  margin: {
    top: auto;
    bottom: auto;
  }
  display: flex;
  align-items: center;
}
</style>