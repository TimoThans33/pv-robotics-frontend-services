import * as THREE from 'three';
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js'

export class DropoffBox 
{
  constructor(direction, pose, size=[1.0, 0.9, 0.05]) 
  {   
    // main parameters
    this.name = direction;
    this.pose = pose;
    this.clickable = true;
    this.interactive = true;

    var payload_material_side = new THREE.MeshBasicMaterial( {color: "#dcddde"} );
    var material_top = new THREE.MeshBasicMaterial( {color: "gray"} );
    var materials = [payload_material_side, payload_material_side,payload_material_side, payload_material_side, material_top, payload_material_side]
  
    var geometry = new THREE.BoxGeometry(size[0], size[1], size[2] );

    this.mesh = new THREE.Mesh( geometry, materials );

    this.mesh.name = direction;
    this.mesh.position.set(pose[0], pose[1], size[2]/2);
    this.mesh.rotation.set(0, 0, pose[2], "XYZ" );
    this.setNumber(direction, this.mesh);

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

  setNumber(number, mesh=this.mesh)
  {
    const loader = new FontLoader(); 
    var textGeo;
    loader.load( '/static/assets/fonts/helvetiker_bold.typeface.json', function ( font ) {

    textGeo = new TextGeometry( number.toString(), {
        font: font,
        size: 0.2,
        height: 0.02,
      } );

      var text_mesh = new THREE.Mesh(textGeo);
      text_mesh.position.set(-0.08, 0.25, 0.02); 
      text_mesh.rotation.set(0, 0, -1.57)

      mesh.add(text_mesh);
      
    } );
  }


  showCross()
  {
    const halfCellLength = 0.4;
    const halfCellWidth = 0.3;
    const halfCrossWidth = 0.1;
    const layerHeight = 0.03;
    
    const crossShape = new THREE.Shape();

    crossShape.moveTo(-halfCellLength, -halfCellWidth);
    crossShape.lineTo(-halfCellLength+halfCrossWidth, -halfCellWidth);
    crossShape.lineTo(0, -halfCrossWidth);
    crossShape.lineTo(halfCellLength-halfCrossWidth, -halfCellWidth);
    crossShape.lineTo(halfCellLength, -halfCellWidth);
    crossShape.lineTo(halfCellLength, -halfCellWidth+halfCrossWidth);
    crossShape.lineTo(halfCrossWidth, 0);
    crossShape.lineTo(halfCellLength, halfCellWidth-halfCrossWidth);
    crossShape.lineTo(halfCellLength, halfCellWidth);
    crossShape.lineTo(halfCellLength-halfCrossWidth, halfCellWidth);
    crossShape.lineTo(0, halfCrossWidth);
    crossShape.lineTo(-halfCellLength+halfCrossWidth, halfCellWidth);
    crossShape.lineTo(-halfCellLength, halfCellWidth);
    crossShape.lineTo(-halfCellLength, halfCellWidth-halfCrossWidth);
    crossShape.lineTo(-halfCrossWidth, 0);
    crossShape.lineTo(-halfCellLength, -halfCellWidth+halfCrossWidth);
    crossShape.lineTo(-halfCellLength, -halfCellWidth);

    const crossGeometry = new THREE.ShapeGeometry(crossShape);
    const crossMaterial = new THREE.MeshBasicMaterial({color: 0x1884240});

    const cross_mesh = new THREE.Mesh( crossGeometry, crossMaterial );
    cross_mesh.position.set(0,0,0.026);
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

  vizBlocking(isBlocking){
    switch (isBlocking){
      case true:
        this.showCross();
        break;
      case false:
        this.hideCross();
        break;
      default :
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
}
