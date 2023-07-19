import * as THREE from 'three';


export class Floor 
{
  constructor() 
  { 

    this.object = new THREE.Group();
    this.object["name"] = "floor";
    

    var geometry = new THREE.PlaneGeometry( 70, 70, 1, 1 );
    // geometry.rotateX( - Math.PI / 2 );
    // var floorTexture = new THREE.TextureLoader().load( '/static/assets/floor/checker-480x480.jpg' )
    var floorTexture = new THREE.TextureLoader().load( '/static/assets/textures/concrete3.jpg' )
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.anisotropy = 1;
    floorTexture.repeat.set(15,15);
    var material = new THREE.MeshBasicMaterial( {map: floorTexture} );
    this.plane = new THREE.Mesh( geometry, material );
    this.plane["name"] = "plane";

    this.plane.material.side = THREE.DoubleSide;

    const grid = new THREE.GridHelper(30, 30 );
    // grid.geometry.rotateX( Math.PI / 2 );
    grid.matrixAutoUpdate  = false;
    // grid.material.opacity = 0.5;
    grid.material.transparent = true;


    this.object.add(this.plane);

    // this.object.add(grid);

    
  }
  toggleAxis()
  {
    this.axis.visible = !this.axis.visible;
  }
  togglePlane()
  {
    this.plane.visible = !this.plane.visible;
  }

}
