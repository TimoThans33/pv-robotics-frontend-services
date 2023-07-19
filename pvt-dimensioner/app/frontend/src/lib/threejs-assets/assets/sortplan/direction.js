import * as THREE from "three";
import { DropoffBox } from "@/lib/threejs-assets/assets/sortplan/dropoff-box.js";
import { transformEuler } from "@/lib/threejs-assets/utils/math.js";
import { useMainStore } from '@/stores/main';

export class Direction {
  constructor(direction, params, node) {
    this.name = direction;
    this.side = params.side;
    this.container_type = params.container.type;
    this.blocking_nodes = params.container.blocking_nodes;
    this.blocking_nodes.push(node.name);

    this.store = useMainStore();

    this.isBlocking = false;

    this.direction = direction;
    this.node = node;

    this.clickable = true;
    this.events = {};
    this.boxes = {};
    this.group = new THREE.Group();
    this.group.name = direction;
  }

  loadObject() {
    var pose = this.node.getPosition();
    var orientation = this.node.getOrientation();
    var trans =
      this.side > 0
        ? transformEuler([0.0, -0.9, 0.0], [pose.x, pose.y], orientation.z)
        : transformEuler([0.0, 0.9, 0.0], [pose.x, pose.y], orientation.z);
    var box_pose = [trans[0], trans[1], Math.abs(orientation.z)];

    var box = new DropoffBox(this.direction, box_pose);
    // assign its child's parent as this obj
    box.mesh.userData.parent = this;

    this.addEventListener("rightClick", this.rightClick.bind(this));
    this.boxes[this.direction] = box;
    this.group.add(box.mesh);
  }

  getAllObjects() {
    return Object.values(this.boxes);
  }

  getAllInteractiveObjects() {
    var meshes = [];
    for (const box of Object.values(this.boxes)) {
      if (box.interactive) meshes.push(box.mesh);
    }
    return meshes;
  }
  addEventListener(type, func) {
    if (type in this.events) this.events[type].push(func);
    else {
      this.events[type] = [func];
    }
  }
  dispatchEvent(event_name, parent, mouse = [0, 0]) {
    if (!(event_name in this.events)) {
      return;
    }

    for (const func of this.events[event_name]) {
      func(parent, mouse);
    }
  }

  block() {
    if (this.isBlocking) return;

    this.blocking_nodes.push(this.node.name);
    for (let [zone, cells] of Object.entries(this.getBlockCells())) {
      let fipp_client = this.store.getNavigationClient(zone);
      if (fipp_client === null) continue;
      fipp_client.manualBlock(cells).then(() => {
        for (const cell of cells) {
          console.log(cell + "is blocked");
        }
      });
    }
    this.isBlocking = true;
    this.boxes[this.direction].vizBlocking(this.isBlocking);
  }

  clear() {
    if (!this.isBlocking) return;

    this.blocking_nodes.push(this.node.name);
    for (let [zone, cells] of Object.entries(this.getBlockCells())) {
      let fipp_client = this.store.getNavigationClient(zone);
      if (fipp_client === null) continue;
      fipp_client.clearNodes(cells).then(() => {
        for (const cell of cells) {
          console.log(cell + "is cleared");
        }
      });
    }
    this.isBlocking = false;
    this.boxes[this.direction].vizBlocking(this.isBlocking);
  }

  getBlockCells() {
    var msg = {};
    for (const node of this.blocking_nodes) {
      let zone = node.split("/")[1];
      if (!(zone in msg)) {
        msg[zone] = [];
      }
      msg[zone].push(node);
    }
    return msg;
  }

  getJSON() {
    let json =  [
      {
        key: "Direction",
        data: {
          name: "Direction",
          value: this.name,
        }
      }
    ]
    return json;
  }

  rightClick()
  {
    if(this.store.ToggleDirectionWindow()) {
      var json = this.getJSON();
      this.store.setDirectionInfo(json);
      this.store.setBlockFunc(this.block.bind(this));
      this.store.setClearFunc(this.clear.bind(this));
    }
  }
}
