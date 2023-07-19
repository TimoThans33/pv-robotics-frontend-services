import * as THREE from 'three';
import {Zone} from '@/lib/threejs-assets/assets/zone/zone';


export class Floorplan 
{
  constructor(name, pose=[0,0,0])
  {   
    // main parameters
    this.name = name;
    this.pose = pose;


    this.zones = {}
    this.group = new THREE.Group();
    this.group.name = name;

    this.setPose(pose);
  }

  loadFromObject(map)
  {
    if("zones" in map)
    {
      for(const zone of map.zones)
      {
        var z = new Zone(zone.id);
        z.loadFromObject(zone);
        this.zones[zone.id] = z;
        this.group.add(z.group);
      }
    }
  }

  getAllObjects()
  {
    var objects = []
    for(const zone of Object.values(this.zones))
    {
      objects = objects.concat(zone.getAllObjects());
    }
    return objects;
  }

  getAllInteractiveObjects()
  {
    var meshes = []
    for(const zone of Object.values(this.zones))
    {
      meshes = meshes.concat(zone.getAllInteractiveObjects());
    }
    return meshes;
  }

  getZones()
  {
    return this.zones;
  }

  getZone(zone_id)
  {
    return this.zones[zone_id];
  }

  setPose(pose)
  {
    this.group.rotation.set(0.0, 0.0,pose[2]);
    this.group.position.set(pose[0],pose[1],0.01);
    this.pose = pose;
  }

}

