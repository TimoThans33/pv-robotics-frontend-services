<template>
  <div class="flex flex-column align-items-stretch w-screen d-root">
    <Menubar :model="items" class="p-0"> </Menubar>

    <div class="flex flex-row container">
      <div ref="scenecontainer" class="flex w-full h-full w-75">
        <Renderer ref="renderer" antialias resize="parent">
          <Camera ref="camera" />
          <Scene ref="scene" background="#ffffff"> </Scene>
        </Renderer>
        <div class="btn-src">
          <Button icon="fas fa-rotate-right" class="p-button-rounded p-button-secondary mb-2" v-tooltip.left="'Rotate'" @click="rotateElem()"/>
          <Button icon="fas fa-location-arrow" class="p-button-rounded p-button-secondary" v-tooltip.left="'Reset view'" @click="resetView()"/>
        </div>
      </div>
      <div class="flex flex-row w-3 align-content-baseline flex-wrap bg-white">
        <NotificationWindow
          class="flex align-items-baseline w-full notifications"
          :style="{ 'overflow-y': 'scroll' }"
        />
        <ControlsWindow
          ref="controls"
          class="flex align-items-center w-full test"
        />
      </div>
    </div>

    <Sidebar
      v-model:visible="show_robots"
      :baseZIndex="-1"
      :style="{ top: '90px', height: 'calc(100% - 90px)', width: '30rem'}"
    >
      <DataTable
        :value="robots"
        v-model:selection="selected_robot"
        selectionMode="single"
        dataKey="id"
        class="p-datatable w-full mt-1"
      >
        <template #empty> No Robots Active </template>
        <Column field="status" :sortable="true">
          <template #body="{ data }">
            <i
              v-if="data.status === 'ready_to_sort'"
              class="pi pi-circle-fill text-green-600"
              style="font-size: 1.4rem; te"
            ></i>
            <i
              v-else-if="data.status === 'activated'"
              class="pi pi-minus-circle text-yellow-600"
              style="font-size: 1.4rem"
            ></i>
            <i
              v-else
              class="pi pi pi-minus-circle text-gray-600"
              style="font-size: 1.4rem"
            ></i>
          </template>
        </Column>
        <Column field="connected" :sortable="true">
          <template #body="{ data }">
            <i
              v-if="data.connected"
              class="pi pi-wifi text-green-600"
              style="font-size: 1.4rem; te"
            ></i>
            <span v-else class="fa-stack fa-1x">
              <i class="fa fa-wifi fa-stack-1x"></i>
              <i class="fa fa-ban fa-stack-2x" style="color: Tomato"></i>
            </span>
          </template>
        </Column>
        <Column field="sort_key" :sortable="true" style="font-size: 1.4rem; te">
          <template #body="{ data }">
            <span
              ><small>{{ data.series }}</small
              ><b>{{ data.number }}</b></span
            >
          </template>
        </Column>
        <Column field="battery_percentage" :sortable="true" style="font-size: 1.4rem; te">
          <template #body="{ data }">
            <span
              v-if="data.battery_percentage < 30"
            >
              <i class='fa fa-battery-quarter'></i>
            </span>
          </template>
        </Column>
        <Column field="actions">
          <template #body="slotProps">
            <Button
              type="button"
              label="Disable"
              class="p-button-raised p-button-danger"
              @click="openDisableWindow(slotProps)"
            />
          </template>
        </Column>
        <Column field="menu">
          <template #body="slotProps">
            <Button
              type="button"
              icon="pi pi-cog"
              @click="openRobinWindow(slotProps)"
            />
          </template>
        </Column>
      </DataTable>
    </Sidebar>

    <NodeWindow ref="nodeWindow" :baseZindex="10000" class="w-3" />
    <RobinWindow :baseZindex="10000" class="w-3" />
    <DirectionWindow ref="directionWindow" :baseZindex="10000" class="w-3" />
    <InputNodeWindow ref="inputNodeWindow" :baseZindex="10000" class="w-3" />
    <DisableWindow ref="disableWindow" :baseZindex="10000" class="w-3" />
  </div>
</template>
<script >
import { ref, computed } from "vue";
import { Vector3 } from "three";
import * as THREE from 'three';
import { Robin } from "@/lib/threejs-assets/assets/robin/robin";
import { Trajectory } from "@/lib/threejs-assets/assets/trajectory/trajectory";
import { Corridor } from "@/lib/threejs-assets/assets/corridor/corridor";
import Button from "primevue/button";
import SelectButton from "primevue/selectbutton";
import InputText from "primevue/inputtext";
import Menubar from "primevue/menubar";

import Sidebar from "primevue/sidebar";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

import { useMainStore } from "@/stores/main";

import ControlsWindow from "@/components/controls.vue";
import NotificationWindow from "@/components/notifications.vue";
import { Node } from "@/lib/threejs-assets/assets/node/node";
import { InputBox } from '@/lib/threejs-assets/assets/node/input-box';
import NodeWindow from "@/lib/threejs-assets/assets/node/node_window.vue";
import InputNodeWindow from "@/lib/threejs-assets/assets/node/input_node_window.vue";
import RobinWindow from "@/lib/threejs-assets/assets/robin/robin_window.vue";
import DisableWindow from "@/lib/threejs-assets/assets/robin/disable_window.vue";
import DirectionWindow from "@/lib/threejs-assets/assets/sortplan/direction_window.vue";

import { OperationWorld } from "@/lib/threejs-assets/scenes/OperationWorld";

import { Floorplan } from "@/lib/threejs-assets/assets/floorplan/floorplan";
import { Sortplan } from "@/lib/threejs-assets/assets/sortplan/sortplan";
import { FippClient } from "@/lib/navigation/fipp_client";
import { Camera, Renderer, Scene } from "troisjs";

export default {
  components: {
    Camera,
    Renderer,
    Scene,
    Menubar,
    Sidebar,
    DataTable,
    Column,
    Button,
    ControlsWindow,
    NotificationWindow,
    NodeWindow,
    InputNodeWindow,
    DirectionWindow,
    RobinWindow,
    DisableWindow,
  },
  setup() {
    const store = useMainStore();

    return {
      store,
    };
  },
  data() {
    return {
      show_robots: false,
      world: null,
      qb_api: null,
      qb_logic: null,
      qb_storage: null,
      qb_ds: null,
      devices: {},
      robots_in_qb_storage: {},
      trajectories: {},
      corridors: {},
      clients: {},
      container_boxes: {},
      robots: [],
      selected_robot: null,
      devices_initialized: false,

      items: [
        {
          label: "System",
          items: [
            {
              label: "Turn on",
              command: () => {
                this.turnOn();
              },
            },
            {
              label: "Turn off",
              command: () => {
                this.turnOff();
              },
            },
            {
              separator: true,
            },
            {
              label: "Play",
              command: () => {
                this.play();
              },
            },
            {
              label: "Pause",
              command: () => {
                this.pause();
              },
            },
            {
              separator: true,
            },
            {
              label: "Resume Shift (Sorting)",
              command: () => {
                this.sorting();
              },
            },
            {
              label: "End Shift (Homing)",
              command: () => {
                this.homing();
              },
            },
          ],
        },
        {
          label: "Robots",
          command: () => {
            this.getEnabledRobots();
            this.show_robots = !this.show_robots;
          },
        },
      ],
    };
  },
  mounted() {
    // Every scene will define the following from troisjs
    // renderer, scene and camera
    const renderer = this.$refs.renderer.renderer;
    const scene = this.$refs.scene.scene;
    const camera = this.$refs.camera.camera;

    const controls = this.$refs.controls;

    this.store.$subscribe((mutation, state) => {
      // this call has to be called slightly later since the dom has to be updated
      setTimeout(this.resizeCanvasToParent, 1);
    });

    // create world
    const world = new OperationWorld(renderer, scene, camera);

    this.$qb_api.subscribeBinary(1, (data) => {
      if (!this.devices_initialized) return;
      if (data.byteLength % 28 !== 0) return;
      for (var i = 0; i < data.byteLength / 28; i++) {
        var offset = i * 28;
        var dv = new DataView(data.slice(offset));
        // var idx = dv.getInt8(0);
        var x = dv.getInt32(0) / 1000000.0;
        var y = dv.getInt32(4) / 1000000.0;
        var theta = dv.getInt32(8) / 1000000.0;
        var mode = dv.getUint8(12);
        // var lidar = new Uint8Array(data.slice(offset + 13, offset + 24));
        var enc = new TextDecoder("utf-8");
        var id = enc.decode(
          new Uint8Array(data.slice(offset + 24, offset + 28))
        );
        if (!(id in this.devices)) {
          let ip = "0.0.0.0";
          let number = id.includes("robin")
            ? id.replace("robin", "")
            : parseInt(id.substr(id.length - 2), 10);
          let port = 3005 + 10 * number;
          if (id in this.robots_in_qb_storage) {
            if ("ip" in this.robots_in_qb_storage[id])
              ip = this.robots_in_qb_storage[id].ip;
            if ("port" in this.robots_in_qb_storage[id])
              port = this.robots_in_qb_storage[id].port;
          }

          let dev = new Robin(id, number, ip, port);
          dev.addEventListener("click", (p, m) => {
            p.select();
            world.setNextClick((obj, mouse) => {
              if (obj === null || !(obj instanceof Node)) {
                p.deselect();
                this.selected_robot = null;
              } else {
                let position = obj.getPosition();
                let orientation = obj.getOrientation();
                p.client.setPosition(position.x, position.y, orientation._z);
                p.deselect();
                this.selected_robot = null;
              }
            });
          });
          this.devices[id] = dev;
          this.world.add(this.devices[id]);
        } else {
          this.devices[id].setMotionState(mode);
          this.devices[id].setPosition(x, y, theta);
        }
      }
    });

    this.$qb_ds.getNavigation().then((fipps) => {
      let navClient = {};
      for (const [key, value] of Object.entries(fipps)) {
        let fipp = new FippClient(`${key}`, `${value.ip}`, value.port + 2);
        navClient[`${key}`] = fipp;
      }
      this.store.setNavigation(navClient);

      this.$qb_storage.getFloorplan().then((res) => {
        let map = new Floorplan("map");
        map.loadFromObject(res);
        world.addGroup(map);
        
        this.$qb_ds.getCellMap().then((cells) => {
          this.store.setCellMap(cells);

          this.$qb_storage.getSortplan().then((reply) => {
            let plan = new Sortplan("sortplan");
            plan.loadFromObject(reply, world);
            world.addGroup(plan);

            this.$qb_storage.getDevices().then((res) => {
              if ("devices" in res) {
                for (const [key, value] of Object.entries(res.devices)) {
                  let default_ip = "ip" in value ? value.ip : "0.0.0.0";
                  let default_port = "port" in value ? value.port + 5 : 3015;

                  this.robots_in_qb_storage[key] = {
                    ip: default_ip,
                    port: default_port,
                  };
                }
                this.devices_initialized = true;
              }
            });
          });     
        });
      });
    });

    this.$qb_api.subscribe("/qb/logic/mode", (data) => {
      let mode = JSON.parse(data);
      if (this.store.setSortingMode(mode) && "inputs" in mode) {
        for (const [key, value] of Object.entries(mode.inputs)) {
          world.getObjectByName(`${key}`).setStatus(`${value}`);
        }
      }
    });

    this.$qb_api.subscribe("/notifications", (notification, description) => {
      this.store.addNotification(notification, description);
    });

    this.$qb_api.subscribe("/viz/global_costs_node", (data) => {
      this.store.vizGlobalCost(data.nodes);
    });

    this.$qb_api.subscribe("/viz/trajectory", (data) => {
      let msg = JSON.parse(data);
      let id = msg[0].id;
      if (id in this.trajectories) {
        world.remove(this.trajectories[id]);
      }
      let traj = new Trajectory(id, msg);
      this.trajectories[id] = traj;
      world.add(traj);
    });

    this.$qb_api.subscribe("/viz/corridor", (data) => {
      let msg = JSON.parse(data);
      let id = msg.id;
      if (id in this.corridors) {
        world.remove(this.corridors[id]);
      }
      let traj = new Corridor(id, msg.corridor);
      this.corridors[id] = traj;
      world.add(traj);
    });

    this.$qb_api.subscribe("/viz/lidar", (data) => {
      let msg = JSON.parse(data);
      let id = msg.name;
      let lidar = msg.lidar_distances;
      let battery = msg.battery;
      if (id in this.devices) {
        this.devices[id].updateLidarBeams(lidar);
        this.devices[id].updateBattery(battery);
      }
    });

    this.store.setDisableFunc(this.disableRobot.bind(this));

    this.world = world;

  },
  watch: {
    // whenever question changes, this function will run
    selected_robot(n, o) {
      if (n) {
        const d = this.devices[n.id];
        d.select();
        this.world.setNextClick((obj, mouse) => {
          if (obj === null || !(obj instanceof Node)) {
            d.deselect();
            this.selected_robot = null;
          } else {
            let position = obj.getPosition();
            let orientation = obj.getOrientation();
            d.client.setPosition(position.x, position.y, orientation._z);
            d.deselect();
            this.selected_robot = null;
          }
        });
      }
      if (o) {
        this.devices[o.id].deselect();
      }
    },
  },
  methods: {
    turnOn() {
      console.log("turnOn");
      this.$qb_logic.setInitMode();
    },
    turnOff() {
      console.log("turnOff");
      this.$qb_logic.setOffMode();
    },
    play() {
      console.log("play");
      this.$qb_logic.play();
    },
    pause() {
      console.log("pause");
      this.$qb_logic.pause();
    },
    sorting() {
      console.log("set resume shift/sorting mode");
      this.$qb_logic.setSortingMode();
    },
    homing() {
      console.log("set end shift/homing mode");
      this.$qb_logic.setHomingMode();
    },
    getEnabledRobots() {
      this.$qb_logic.getEnabledRobots().then((res) => {
        if (res === null) {
          this.robots = [];
          return;
        }
        let tmp = [];
        for (const [key, value] of Object.entries(res)) {
          tmp.push({
            // only show last 2 digit of robot id
            number: `${key}`.slice(`${key}`.length - 2),
            series: `${key}`.slice(0, `${key}`.length - 2),
            sort_key:
              `${key}`.slice(`${key}`.length - 2) +
              `${key}`.slice(0, `${key}`.length - 2),
            id: key,
            status: value.status,
            connected: value.connected,
            battery_percentage: value.battery_percentage
          });
        }
        this.robots = tmp;
      });
    },
    openDisableWindow(e) {
      if (e.data.id in this.devices && this.store.ToggleDisableWindow()) {
        this.store.setDisableInfo(e);
        this.store.setDisableFunc(this.disableRobot.bind(this,e));
      }
      if(!e.data.connected) {
        this.disableRobot(e);
        return;
      }
    },
    disableRobot(e) {
      this.$qb_logic.deactivateRobot(e.data.id).then(() => {
        if (this.devices[e.data.id]) {
          this.devices[e.data.id].client.disable();
        }
        
        setTimeout(() => { this.getEnabledRobots(); }, 1000);
      });
    },
    openRobinWindow(e) {
      if (e.data.id in this.devices && this.store.ToggleRobinWindow()) {
        let json = this.devices[e.data.id].getJSON();
        this.store.setRobinInfo(json);
        this.store.setClient(this.devices[e.data.id].client);
      }
    },
    rotateElem() {
      this.$refs.scene.scene.rotateZ(-90 * Math.PI/180);
    },

    resetView() {
     this.$refs.camera.camera.position.set(0, -0.000024999999999053557, 24.999999999987487 );
     this.$refs.camera.camera.rotation.set(0, 0, 0);
     this.$refs.scene.scene.rotation.set(0, 0, 0);
    },
  },
};
</script>


<style scoped lang="scss">
.d-root {
  height: calc(100% - 50px);
}

.container {
  height: 98%;
}

.notifications {
 max-height: 65vh;
 min-height: 65vh;
}

@media only screen and (min-width: 768px) and (max-width: 1366px) {
  .notifications {
    max-height: 57vh;
    min-height: 57vh;
  }
}

::v-deep(.p-menubar) {
  height: 40px;
}

.w-75 {
  width: 75% !important;
}

.btn-src {
  position: fixed;
  bottom: 0rem;
  left: 70%;
  padding: 12px;
  display: inline-grid; 
}

.btn-src .p-button {
  height: 3rem;
  width: 3rem;
}

</style>

