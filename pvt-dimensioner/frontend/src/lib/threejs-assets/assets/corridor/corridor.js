import { 
  MeshLambertMaterial, 
  Group, 
  BoxGeometry,
  MeshBasicMaterial,
  Mesh,
  Vector3,
  Euler,
  Box3,
  Box3Helper,
  BoxHelper,
  LineBasicMaterial,
  BufferGeometry,
  BufferAttribute,
  Line,
  AxesHelper,
  ArrowHelper,
  Shape,
  ShapeGeometry,
  DoubleSide

} from 'three';


export class Corridor 
{
  constructor(name, points, pose=[0,0,0]) 
  {   
    // main parameters
    this.object = new Group();
    this.object.up = new Vector3(0,0,1);
    this.object["name"] = name;

    this.name = name;
    this.device = name;
    this.pose = pose;


    this.clickable = false;
    this.interactive = false;


    var material = new LineBasicMaterial( { color: "rgb(255,0,0)" , linewidth: 3} );
    var points_vec = [];
    
    for (var i=0; i<(points.length); i++)
    {
      points_vec.push(new Vector3(points[i][0], points[i][1], 0) );
    }

    var geometry = new BufferGeometry().setFromPoints( points_vec );

    this.mesh = new Line(geometry, material);
  
    this.mesh.rotation.set(0.0, 0.0,pose[2]);
    this.mesh.position.set(pose[0],pose[1],0.04);
  
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

