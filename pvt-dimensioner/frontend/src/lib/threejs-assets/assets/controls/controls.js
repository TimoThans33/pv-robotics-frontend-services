import * as THREE from 'three';
import {OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export class Controls 
{
  constructor(camera, element) 
  { 
    const controls = new OrbitControls( camera, element );
    controls.saveState();
    controls.screenSpacePanning = true;
    
  }

}
