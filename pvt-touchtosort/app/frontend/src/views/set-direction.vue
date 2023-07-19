<template>
      <div class="flex flex-column align-items-stretch w-screen d-root">
        <Menubar :model="menu" class="p-0"> </Menubar>
        <div class="flex flex-row container">
            <div ref="scenecontainer" class="flex w-full h-full w-75">
                <Renderer ref="renderer" antialias resize="parent">
                <Camera ref="camera" />
                <Scene ref="scene" background="#ffffff"> </Scene>
                </Renderer>
            </div>
            <div class="flex flex-row w-3 align-content-baseline flex-wrap bg-white">
            <div class="flex align-items-baseline w-full" style="padding-right: 10px">
            <div style="text-align: center; background: white; width: 50%">
              <h3 style="font-size: 1.5em; border-radius: 10px 0 0 10px; background: var(--surface-400); border-bottom: 5px solid var(--surface-500);">
                Throughput of this infeed:</h3>
              <p style="margin: 0; font-size: 2em; font-style: bold">
                {{ throughputThisInfeed }} pph
              </p>
            </div>
            <div style="text-align: center; background: white; width: 50%">
              <h3 style="font-size: 1.5em; border-radius: 0 10px 10px 0; background: var(--surface-400); border-bottom: 5px solid var(--surface-500);">
                Overall throughput:</h3>
                <p style="margin: 0; font-size: 2em; font-style: bold">
                  {{ throughputAll }} pph
                </p>
            </div>
            </div>
            <div class="flex w-full align-items-baseline" style="padding-right: 10px">
              <div class="row">
                <h3 class="card card-large">Direction</h3>
                <ph class="bottom-card" style="font-size: 4em;">{{ direction }}</ph>
              </div>
              <div class="row">
                <h3 class="card card-large card-right">Robot</h3>
                <ph class="bottom-card" style="font-size: 4em;">{{ robot }}</ph>
              </div>
            </div>
            <div class="flex w-full align-items-baseline" style="padding-right: 10px">
              <div class="row">
                <h3 class="card">Direction</h3>
                <ph class="bottom-card" style="font-size: 3em;">{{ direction_queue[0] }}</ph>
              </div>
              <div class="row">
                <h3 class="card card-right">Robot</h3>
                <ph class="bottom-card" style="font-size: 3em;">{{ robot_queue[0] }}</ph>
              </div>
            </div>
            <div class="flex w-full align-items-baseline" style="padding-right: 10px">
              <div class="row">
                <h3 class="card">Direction</h3>
                <ph class="bottom-card" style="font-size: 3em;">{{ direction_queue[1] }}</ph>
              </div>
              <div class="row">
                <h3 class="card card-right">Robot</h3>
                <ph class="bottom-card" style="font-size: 3em">{{ robot_queue[1] }}</ph>
              </div>
            </div>
            <div class="flex align-items-baseline w-full" style="padding-right: 10px">
              <div style="text-align: center; border-bottom: 5px solid var(--surface-500); border-radius: 10px 0 0 10px; background: lightgray; width: 50%">
              <p style="font-size: 2em;">Infeed: {{ scanner_id }}</p>
              </div>
              <div style="text-align: center; border-bottom: 5px solid var(--surface-500); border-radius: 0 10px 10px 0; background: lightgray; width: 50%">
              <p style="font-size: 2em;">status: {{ infeed_status }}</p>
              </div>
            </div>
            </div>
          </div>
        </div>
</template>
<script>
import Menubar from "primevue/menubar";
import { useMainStore } from "@/stores/main";

import { OperationWorld } from "@/lib/threejs-assets/scenes/OperationWorld";
import { Floorplan } from "@/lib/threejs-assets/assets/floorplan/floorplan";
import { Sortplan } from "@/lib/threejs-assets/assets/sortplan/sortplan";
import { Camera, Renderer, Scene } from "troisjs";

export default {
  components: {
      Camera,
      Renderer,
      Scene,
      Menubar,
  },
  setup() {
    const store = useMainStore();
    return {
      store,
    };
  },
  data() {
    return {
      world: null,
      qb_storage: null,
      qb_ds: null,
      qb_api: null,
      qb_logic: null,
      throughputThisInfeed: 0,
      throughputAll: 0,
      direction: "",
      robot: "",
      robot_queue: [],
      direction_queue: [],
      infeed_id: "",
      infeed_status: "OFF",
      scanner_id: Number.MAX_SAFE_INTEGER.toString(),
      infeeds: [],
      sort_start_time: 0.0,
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
    const renderer = this.$refs.renderer.renderer;
    const scene = this.$refs.scene.scene;
    const camera = this.$refs.camera.camera;

    const world = new OperationWorld(renderer, scene, camera);

    this.updateDefaultScannerID();
    this.updateInfeed();

    this.$qb_storage.getFloorplan().then((res) => {
      let map = new Floorplan("map");
      map.loadFromObject(res);
      world.addGroup(map);

      this.$qb_storage.getSortplan().then((reply) => {
        let plan = new Sortplan("sortplan");
        plan.loadFromObject(reply, world);
        world.addGroup(plan);
      });
    });

    this.$qb_api.subscribe("/qb/ds/piece_to_output", (data) => {
      console.log("piece_to_output", data.extra.input_cell);
      if (data.extra.input_cell != this.infeed_id) return;
      this.direction = data.extra.direction;
      this.robot = data.extra.robot_id;
      console.log("dequeue", data.extra.robot_id, data.extra.direction)
      this.robot_queue.shift();
      this.direction_queue.shift();
    });

    this.$qb_api.subscribe("/qb/ds/current_robot_update", (data) => {
      console.log("update_robot_queue", data.extra.current_robot, data.extra.input_cell);
      if (data.extra.cell_id != this.infeed_id) return;
      if (!data.extra.current_robot) return;
      this.robot = data.extra.current_robot;
      this.direction = "Scan"
    });

    this.$qb_api.subscribe("/qb/ds/update_parcel_queue", (data) => {
      console.log("update_parcel_queue", data.extra.direction, data.extra.input_cell);
      if (data.extra.cell_id != this.infeed_id) return;
      this.direction_queue.push(data.extra.direction);
      console.log("added to direction queue", this.direction_queue[this.direction_queue.length - 1]);
    });

    this.$qb_api.subscribe("/qb/ds/update_throughput", (data) => {
      this.throughputThisInfeed = data.extra.infeed_throughput;
      this.throughputAll = data.extra.overall_throughput;
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

    this.store.setTargetFunc(this.setDirection.bind(this));

    this.world = world;

  },
  methods: {

    resetContext() {
      this.robot = "";
      this.direction = "";
      this.robot_queue = [];
      this.direction_queue = [];
      this.throughputThisInfeed = 0;
      this.throughputAll = 0;
      this.infeeds = [];
    },

    setDirection(direction, cell_id) {
      this.$qb_ds.setTarget(direction, cell_id);
    },

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
            this.store.setInfeed(`${key}`);
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
  }
};
</script>
<style scoped lang="scss">
.d-root {
  height: calc(100% - 50px);
}
.card {
  font-size: 1.5em; 
  border-radius: 10px 0 0 10px; 
  background: var(--surface-400);
  border-bottom: 5px solid var(--surface-500);
}

.card-large {
  font-size: 2em;
}

.card-right {
  border-radius: 0 10px 10px 0;
}

.bottom-card {
  margin: 0; 
  font-style: bold;
  align-items: center;
  justify-content: center; 
  height: 100%; 
  width: 100%; 
  display: flex; 
  font-size: 2em; 
  padding: 50px;
}

.row:after {
  content: "";
  display: table;
  clear: both;
}
.column {
  float: left;
  font-size: 1em;
  text-align: center;
  background: lightgray;
  width: 50%
}

.container {
  height: 98%;
}
.top-row p {
  margin: 0.3em 0;
}

.row {
  text-align: center; 
  background: white; 
  width: 50%;
}

.smaller {
  font-size: 0.9em;
}

.w-75 {
  width: 75% !important;
}
</style>