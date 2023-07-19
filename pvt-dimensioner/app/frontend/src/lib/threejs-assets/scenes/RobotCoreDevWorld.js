import * as THREE from 'three';
import {Floor} from '@/lib/threejs-assets/assets/floor/floor'
import {Controls} from '@/lib/threejs-assets/assets/controls/controls'
import { Vector3 } from 'three';


export class RobotCoreDevWorld 
{
  constructor(renderer, scene, camera) 
  { 

    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;


    // create light
    // adjust the camera to primevision reference axis standar (z up)
    this.camera.up = new THREE.Vector3(0,0,1);
    this.camera.position.set(0, 5, 10);

    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
    hemiLight.position.set( 0, 0, 200 );
    this.scene.add( hemiLight );


    // create floor
    this.floor = new Floor();
    this.scene.add(this.floor.object);

    const controls = new Controls(this.camera, this.renderer.domElement);

  }

}