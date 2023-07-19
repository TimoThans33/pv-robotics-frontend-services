import * as THREE from 'three';
import { useMainStore } from '@/stores/main';
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js'
import { transformEuler } from "@/lib/threejs-assets/utils/math.js";

export class InputBox 
{
  constructor(scanner_id, node, size=[0.5, 0.5, 0.05]) 
  {   
    // main parameters
    this.node = node;
    this.name = node.name + '/input_box';

    this.pose = this.getPose(node);
    this.clickable = true;
    this.interactive = true;

    this.store = useMainStore();

    var payload_material_side = new THREE.MeshBasicMaterial( {color: "#D5E8D4"} );
    var material_top = new THREE.MeshBasicMaterial( {color: "#D5E8D4"} );
    var materials = [payload_material_side, payload_material_side,payload_material_side, payload_material_side, material_top, payload_material_side]
  
    var geometry = new THREE.BoxGeometry(size[0], size[1], size[2] );

    this.mesh = new THREE.Mesh( geometry, materials );

    this.mesh.name = this.name;
    this.mesh.position.set(this.pose[0], this.pose[1], size[2]/2);
    this.mesh.rotation.set(0, 0, this.pose[2], "XYZ");

    this.mesh.userData.parent = this;
   
    this.number = scanner_id;
    this.setNumber(this.number);
    this.addArrow();

    // mouse event
    this.events = {};
    this.addEventListener("rightClick", this.rightClick.bind(this));    
  }

  getPose(node)
  {
    var node_pose = node.getPosition();
    var orientation = node.getOrientation();
    var trans = transformEuler([0.0, 0.9, 0.0], [node_pose.x, node_pose.y], orientation.z);
    return [trans[0], trans[1], Math.abs(orientation.z)];
  }

  getAllObjects() {
    return Object.values(this);
  }

  getAllInteractiveObjects() {
    var meshes = [];
    if (this.interactive) meshes.push(this.mesh);
    return meshes;
  }

  show()
  {
    this.mesh.visible = true;
  }
  hide()
  {
    this.mesh.visible = false;
  }
  toggleVisibility()
  {
    this.mesh.visible = !this.mesh.visible;
  }

  setNumber(number,mesh=this.mesh)
  {
    const loader = new FontLoader(); 
    var textGeo;
    loader.load( '/static/assets/fonts/helvetiker_bold.typeface.json', function ( font ) {

    textGeo = new TextGeometry(number.toString(), {
        font: font,
        size: 0.2,
        height: 0.02,
      } );
      var materials = new THREE.MeshBasicMaterial( {color: "rgb(0,64,255)"} );
      var text_mesh = new THREE.Mesh(textGeo, materials);
      text_mesh.position.set(-0.1, 0.1, 0.02); 
      text_mesh.rotation.set(0, 0, -1.57);

      mesh.add(text_mesh);
      
    });
  }

  addArrow(mesh=this.mesh)
  {
    const triangle_shape = new THREE.Shape();

    triangle_shape.moveTo(0.0,-0.6,0.0);
    triangle_shape.lineTo(0.2,-0.3,0.0);
    triangle_shape.lineTo(-0.2,-0.3,0.0);
    triangle_shape.lineTo(0.0,-0.6,0.0);

    const triangle_geometry = new THREE.ShapeGeometry(triangle_shape);
    const triangle_material = new THREE.MeshBasicMaterial({color: "rgb(0,64,255)"});

    const triangle_mesh = new THREE.Mesh( triangle_geometry, triangle_material);

    mesh.add(triangle_mesh);
  }

  addEventListener(type, func)
  {
    if(type in this.events) this.events[type].push(func);
    else
    {
      this.events[type] = [func];
    }
  }

  dispatchEvent(event_name, parent, mouse = [0, 0]) {

    if (event_name in this.events) {
      for (const func of this.events[event_name]) {
        func(parent, mouse);
      }
    }
  }

  setPosition(x, y, theta)
  {
    this.mesh.position.set(x, y, 0.05/2);
    this.mesh.rotation.set(0, 0, theta, "XYZ" );
  }
  getPosition()
  {
    var wp = this.mesh.getWorldPosition();
    return [wp.x, wp.y ,wp.z]; 
  }
  getOrientation()
  {
    var orientation = new THREE.Euler();
    orientation.setFromQuaternion(this.mesh.getWorldQuaternion());
    return orientation;
  }

  getJSONInput()
  {
    let json = this.node.getJSONInput();
    return json;
  }

  rightClick()
  {
    if (this.store.ToggleInputNodeWindow()) {
      var json = this.getJSONInput();
      this.store.setInputNodeInfo(json);
    }
  }
}
