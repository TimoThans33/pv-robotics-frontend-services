import * as THREE from '../../../thirdparty/threejs/three.module.js';


export class Grid 
{
  constructor(name="grid") 
  { 
    this.name = name;

    this.mesh = new THREE.GridHelper( 30, 30 )
    this.mesh.name = name;
    // this.mesh.geometry.rotateX( Math.PI / 2 );
    this.mesh.matrixAutoUpdate  = false;

    this.clickable = false;
    this.interactive = false;
  }

  update()
  {
    this.mesh.updateMatrix();
  }
  show()
  {
    this.mesh.visible = true;
    this.update();
  }
  hide()
  {
    this.mesh.visible = false;
    this.update();
  }

  toggleVisibility()
  {
    this.mesh.visible = !this.mesh.visible;
    this.update();
  }


}
