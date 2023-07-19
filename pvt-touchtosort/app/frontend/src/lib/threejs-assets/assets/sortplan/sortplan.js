import * as THREE from 'three';
import {Direction} from '@/lib/threejs-assets/assets/sortplan/direction.js'
import { useMainStore } from '@/stores/main';
import { InputBox } from '../node/input-box';

export class Sortplan 
{
  constructor(name) 
  {  
    this.group = new THREE.Group();
    this.group.name = name;
    this.name = name;
    this.directions = {};
    this.inputboxes = {}
    this.store = useMainStore();
    this.navClient = this.store.getNavigation();
    this.meshes = []
  }

  loadFromObject(sortPlan, world) {
    for(const key of Object.keys(sortPlan))
    {
      var node_obj = world.getObjectByName(key);
      
      if (sortPlan[key].sub_directions)
      {
        node_obj.logic_destinations = Object.keys(sortPlan[key].sub_directions);
        // create container box
        for(const subDirect of Object.keys(sortPlan[key].sub_directions))
        { 
          this.directions[subDirect]  = new Direction(subDirect, sortPlan[key].sub_directions[subDirect], node_obj);
          this.directions[subDirect].loadObject();
          this.group.add(this.directions[subDirect].group);
        }
      }
    }
  }
  
  getAllObjects()
  {
    var objects = []
    for(const direction of Object.values(this.directions))
    {
      objects = objects.concat(direction.getAllObjects());
    }
    for (const inputbox of Object.values(this.inputboxes))
    {
      objects = objects.concat(inputbox.getAllObjects());
    }
    return objects;
  }

  getAllInteractiveObjects()
  {
    for(const direction of Object.values(this.directions))
    {
      this.meshes = this.meshes.concat(direction.getAllInteractiveObjects());
    }
    for (const inputbox of Object.values(this.inputboxes))
    {
      this.meshes = this.meshes.concat(inputbox.getAllInteractiveObjects());
    }
    return this.meshes;
  }
}
