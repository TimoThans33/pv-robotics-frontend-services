import { 
  Group,
  Vector3,
  Euler,
  LineBasicMaterial,
  BufferGeometry,
  Line
} from 'three';


export class Trajectory 
{
  constructor(name, nodes, pose=[0,0,0]) 
  { 
    this.object = new Group();
    this.object.up = new Vector3(0,0,1);
    this.object["name"] = name;
    // main parameters
    this.name = name;
    this.device = name;
    this.pose = pose;


    this.clickable = false;
    this.interactive = false;


    var material = new LineBasicMaterial( { color: "#008000" , linewidth: 3} );
    var points = [];
    
    for (var k=1; k<(nodes.length); k++){
        let data = nodes[k];
        if(typeof data.x !=='undefined'){
          points.push(new Vector3(data.x, data.y, 0) );
        }   
    }

    var geometry = new BufferGeometry().setFromPoints( points );

    this.mesh = new Line(geometry, material);
  
    this.mesh.rotation.set(0.0, 0.0,pose[2]);
    this.mesh.position.set(pose[0],pose[1],0.02);
  
    this.mesh.name = this.name;

    this.object.add(this.mesh);
  }

  loadFromObject(node)
  {
    // console.log(node);
  }


  getPosition()
  {
    return this.mesh.getWorldPosition();
  }

  getOrientation()
  {
    var orientation = new Euler();
    orientation.setFromQuaternion(this.mesh.getWorldQuaternion());
    return orientation;
  }
}

