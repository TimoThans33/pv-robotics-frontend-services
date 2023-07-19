import * as THREE from 'three';
import {Node} from '@/lib/threejs-assets/assets/node/node';


export class Zone 
{
  constructor(name, pose=[0,0,0], type="fixed") 
  {   
    // main parameters
    this.id = name;
    this.type = type;
    this.pose = pose;


    this.nodes = {};
    this.group = new THREE.Group();
    this.group.name = name;

    this.setPose(pose);

  }

  getAllObjects()
  {
    return Object.values(this.nodes);
  }

  getAllInteractiveObjects()
  {
    var meshes = []
    for(const node of Object.values(this.nodes))
    {
      if (node.interactive) meshes.push(node.mesh);
    }
    return meshes;
  }

  loadFromObject(zone)
  {
    if("nodes" in zone)
    {
      for(const node of zone.nodes)
      {
        // check if node is absolute id
        if(node.id.split("/").length == 1 )
        {
          var n = new Node(zone.id, node.id, node.pose, node.type);
          this.nodes[node.id] = n;
          this.group.add(n.mesh);
        }


      }
      this.setPose(zone.pose);
    }
  }

  setPose(pose)
  {
    this.group.rotation.set(0.0, 0.0,pose[2]);
    this.group.position.set(pose[0],pose[1],0.01);
    this.pose = pose;
  }


}

