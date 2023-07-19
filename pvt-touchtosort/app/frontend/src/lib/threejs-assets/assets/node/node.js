import * as THREE from 'three';
import { useMainStore } from '@/stores/main';
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry';
import { transformEuler } from "@/lib/threejs-assets/utils/math.js";

export class Node 
{
  constructor(zone, name, pose=[0,0,0], type="init",clear_distance=0, connections=[]) 
  {   
    // main parameters
    this.name = `/${zone}/${name}`;
    this.zone = zone;
    this.type = type;
    this.pose = pose;
    this.clear_distance = clear_distance; // default value
    this.connections = connections;
    this.walkable = true;

    this.clickable = true;
    this.interactive = true;

    this.store = useMainStore();

    // logic params
    this.logic_type="init";
    this.offload_side = 1;
    this.logic_destinations = [];

    // mouse event
    this.events = {};
    //this.addEventListener("rightClick", this.rightClick.bind(this));
    
    var clr = "#FFF2CC";
    if(type === "exit") clr = "#f8cecc";
    if(type === "entry_and_exit") clr = "#DAE8FC";
    if(type === "target") clr = "#D5E8D4";


    var border = new THREE.Shape();
    
    border.moveTo(-0.4, -0.3)
    border.lineTo(0.4, -0.3)
    border.lineTo(0.4, 0.3)
    border.lineTo(-0.4, 0.3)

    border.lineTo(-0.4, -0.3)

    border.lineTo(-0.35, -0.25)
    border.lineTo(-0.35, 0.25)
    border.lineTo(0.35, 0.25)
    border.lineTo(0.35, -0.25)

    border.lineTo(-0.35, -0.25)

    var border_geometry = new THREE.ShapeGeometry( border );
    var border_material = new THREE.MeshBasicMaterial( { side: THREE.DoubleSide, color: clr} );
    var border_mesh = new THREE.Mesh( border_geometry, border_material );
    border_mesh.position.set(0, 0, 0.001);

    border_mesh.userData.parent = this;

    var geometry = new THREE.PlaneGeometry( 0.8, 0.6 );
    var material = new THREE.MeshBasicMaterial( { side: THREE.DoubleSide, color: clr, transparent: true, opacity: 0} );
    this.mesh = new THREE.Mesh( geometry, material );
    this.mesh.userData.parent = this;

    this.mesh.add(border_mesh);
  
    this.mesh.rotation.set(0.0, 0.0,pose[2]);
    this.mesh.position.set(pose[0],pose[1],0.01);
  
    this.mesh.name = this.name;
  }

  setLogicType(type)
  {
    var clr = null;
    if(type === "input") clr = "#D5E8D4"; //"#f8cecc";
    if(type === "output") clr = "#DAE8FC";
    if(type === "in_and_output") clr = "#D5E8D4";
    
    if(clr != null)
    {
      // set opacity and color of middle geometry
      this.mesh.material.color = new THREE.Color(clr);
      this.color = clr;
      this.mesh.material.opacity = 1;
    }
    this.logic_type = type;
  }

  setWalkability(value)
  {
    this.walkable = value;
    if(!this.walkable)
    {
      this.setColor("#f8cecc");
    }
    else
    {
      this.resetColor();
    }
  }

  setOpacity(value)
  {
    if(value != null)
    {
      // set opacity and color of middle geometry
      this.mesh.material.opacity = value;
    }
  }
  setColor(clr)
  {
    if(clr != null)
    {
      // set opacity and color of middle geometry
      this.mesh.material.color = new THREE.Color(clr);
    }
  }
  resetColor()
  {
    // set opacity and color of middle geometry
    this.setColor(this.color);
  }

  setDotColor(clr)
  {
    if(clr != null)
    {
      // set opacity and color of middle geometry
      this.mesh.children[1].material.color = new THREE.Color(clr);
    }
  }

  showCross()
  {
    const lineGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({color: 0x1884240, linewidth: 4,});
    const points = [];

    const halfCellLength = 0.4;
    const halfCellWidth = 0.3;
    const layerHeight = 0.01;

    points.push(-halfCellLength, -halfCellWidth, layerHeight);
    points.push(halfCellLength, halfCellWidth, layerHeight);
    points.push(halfCellLength, -halfCellWidth, layerHeight);
    points.push(-halfCellLength, halfCellWidth, layerHeight);
    points.push(-halfCellLength, -halfCellWidth, layerHeight);
    lineGeometry.setAttribute( 'position', new THREE.Float32BufferAttribute( points, 3 ) );
    lineGeometry.computeBoundingSphere();
    const cross_mesh = new THREE.Line( lineGeometry, lineMaterial );
    cross_mesh.name = "cross";
    for(let i = 0; i < this.mesh.children.length; i++){
      if(this.mesh.children[i].name == "cross") {
        this.mesh.children[i].material.color = new THREE.Color(0x1884240);
        return;
      }
    }
    this.mesh.add(cross_mesh);
  }
  hideCross()
  {
    this.mesh.remove(this.mesh.getObjectByName("cross"));
  }

  setBorderColor(clr)
  {
    if(clr != null)
    {
      // set opacity and color of middle geometry
      this.mesh.children[0].material.color = new THREE.Color(clr);
    }
  }

  showBorder()
  {
    this.mesh.children[0].visible = true;
  }
  hideBorder()
  {
    this.mesh.children[0].visible = false;
  }

  addConnecion(connection)
  {
    if(connection instanceof Node)
    {
      this.connections.push(connection)
    }
  }
  removeConnection(idx)
  {
    this.connections.splice(idx, 1);
  }

  getPosition()
  {
    const vec = new THREE.Vector3( 0, 1, 0 );
    this.mesh.getWorldPosition(vec)
    return vec;
  }

  getOrientation()
  {
    var orientation = new THREE.Euler();
    const quaternion = new THREE.Quaternion();
    this.mesh.getWorldQuaternion(quaternion);
    orientation.setFromQuaternion(quaternion);
    return orientation;
  }
  
  setStatus(status){
    switch (status){
      case 'true':
        this.hideCross();
        break;
      case 'false':
        this.showCross();
        break;
      default :
    }
  }

  addEventListener(type, func)
  {
    if(type in this.events) this.events[type].push(func);
    else
    {
      this.events[type] = [func];
    }
  }

  dispatchEvent(event_name, parent, mouse=[0,0])
  {

    if(event_name in this.events)
    {
      for(const func of this.events[event_name])
      {
        func(parent, mouse);
      }
    }
  }

  getJSON(){
    let position = this.getPosition();
    let orientation = this.getOrientation();
    let json =  [
        {
          key: "Name",
          data: {
            name: "Name",
            value: this.name,
          }
        },

        {
          key: "Type",
          data: {
            name: "Type",
            value: this.type,
          }
        },

        {
          key: "WPose",
          data: {
            name: "World Pose",
            value: [Math.floor(position.x*100)/100,Math.floor(position.y*100)/100, Math.floor(orientation._z*100)/100],
          }
        },
          
      ];
    return json;
  }

  getJSONInput() {
    let json =  [
        {
          key: "Name",
          data: {
            name: "Name",
            value: this.name,
          }
        },         
      ];

    let loadBalance = {
      key: "Balance",
      data: {
        name: "Load Balance",
      },
      expandedIcon: "pi pi-folder-open",
      collapsedIcon: "pi pi-folder",
      children: [
        {
          key: "tReserv",
          data: {
            name: "Target reservations",
            value: "0",
          }
        },
        {
          key: "vtReserv",
          data: {
            name: "Virtual reservations",
            value: "0",
          }
        },
        {
          key: "checkins",
          data: {
            name: "Checkins",
            value: "0",
          }
        },
        {
          key: "parcel",
          data: {
            name: "Parcels onloaded",
            value: "0",
          }
        },
      ]
    };
    json.push(loadBalance);

    return json;
  }

  rightClick()
  {
    if (this.store.isNodeWindowVisible()) {
      this.store.ToggleNodeWindow();
      return;
    }
    
    var json = this.getJSON();
    let fipp = this.store.getNavigationClient(this.zone);
    fipp.getNodes([this.name]).then((res) => {
      let node_info = res[0];
      if ("owner" in node_info) {
        let owner_json = {
          key: "owner",
          data: {
            name: "Owner",
            value: node_info.owner,
          }
        };
        json.push(owner_json);
      }
      this.store.setNodeInfo(json);
      this.store.ToggleNodeWindow();
    });
  }
}

