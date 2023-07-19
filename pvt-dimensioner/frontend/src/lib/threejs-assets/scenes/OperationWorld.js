import * as THREE from 'three';
import {Floor} from '@/lib/threejs-assets/assets/floor/floor'
import {Controls} from '@/lib/threejs-assets/assets/controls/controls'


export class OperationWorld 
{
  constructor(renderer, scene, camera) 
  { 

    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;


    // create light
    // adjust the camera to primevision reference axis standar (z up)
    this.camera.up = new THREE.Vector3(0,0,1);
    this.camera.position.set(0, 0, 25);

    const hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
    hemiLight.position.set( 0, 0, 200 );
    this.scene.add( hemiLight );


    // create floor
    this.floor = new Floor();
    this.scene.add(this.floor.object);

    const controls = new Controls(this.camera, this.renderer.domElement);

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();
    this.objects = {};
    this.clickable_objects = []
    this.next_click = null;
    
    this.renderer.domElement.addEventListener( 'click', this.onMouseClick.bind(this), false );
    this.renderer.domElement.addEventListener( 'touchstart', this.onMouseClick.bind(this), false );

    // for right mouse click
    this.renderer.domElement.addEventListener('contextmenu', this.onMouseClick.bind(this), false);

  }

  add(model)
  {
    this.scene.add(model.object);
    if(model.interactive) this.clickable_objects.push(model.object)
    this.objects[model.name] = model;
  }
  remove(model)
  {
    if ( model.object.parent !== null ) {
      model.object.parent.remove( model.object );
    }
    this.scene.remove(model.object);
  }
  addGroup(group_model)
  {
    this.scene.add(group_model.group);
    this.clickable_objects = this.clickable_objects.concat(group_model.getAllInteractiveObjects());
    var all_objs = group_model.getAllObjects();
    for(const obj of all_objs)
    {
      this.objects[obj.name] = obj;
    }
  }

  getObjectByName(name)
  {
    return this.objects[name];
  }

  setNextClick(func)
  {
    this.next_click = func;
  }

  onMouseClick(event)
  {
    if(event.target.nodeName === "CANVAS")
    {
      let right_click = false;
      let touch_click = false;
      if(event.type === "contextmenu") 
      {
        event.preventDefault();
        right_click = true;
      }
      
      
      if(event.type === "touchstart")
      {
        this.mouse.x = ((event.targetTouches[0].pageX - this.renderer.domElement.offsetLeft) / this.renderer.domElement.clientWidth) * 2 - 1;
        this.mouse.y = -((event.targetTouches[0].pageY  - this.renderer.domElement.offsetTop) / this.renderer.domElement.clientHeight) * 2 + 1;
        touch_click = true;
      }
      else
      {
        // calculate mouse position in normalized device coordinates (-1 to +1) for both components
        this.mouse.x = ( ( event.clientX - this.renderer.domElement.offsetLeft ) / this.renderer.domElement.clientWidth ) * 2 - 1;
        this.mouse.y = - ( ( event.clientY - this.renderer.domElement.offsetTop ) / this.renderer.domElement.clientHeight ) * 2 + 1;
      }




      this.raycaster.setFromCamera( this.mouse, this.camera );
      // calculate objects intersecting the picking ray
      // var intersects = this.raycaster.intersectObjects(this.clickable_objects );
      
      var intersects = this.raycaster.intersectObjects(this.scene.children, true );
      var parent = null;
      for ( let i = 0; i < intersects.length; i ++ ) 
      {
        // find first object
        if(intersects[ i ].object.userData.parent)
        {
          parent = intersects[ i ].object.userData.parent;
          break;
        }
        
    
      }

      if(parent !== null)
      {
        var obj = parent;
        if(this.next_click != null)
        {
          this.next_click(parent, this.mouse);
          this.next_click = null;
        }
        else if(obj.name in this.objects && parent.clickable)
        {
          
          if(right_click)
          {
            parent.dispatchEvent("rightClick", parent, this.mouse);
          }
          else if(touch_click)
          {
            parent.dispatchEvent("touchClick", parent, this.mouse);
          }
          else
          {
            parent.dispatchEvent("click", parent, this.mouse);
          }

        }
      }
      else
      {
        // missed all objects
        if(this.next_click != null)
        {
          this.next_click(null, this.mouse);
          this.next_click = null;
        }
      }

      
    }
  }

}