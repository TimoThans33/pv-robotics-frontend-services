import { 
    MeshLambertMaterial, 
    Group, 
    BoxGeometry,
    MeshBasicMaterial,
    Mesh,
    Vector3,
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

 import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import {FontLoader} from 'three/examples/jsm/loaders/FontLoader.js';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry.js'
import { useMainStore } from '@/stores/main';
import {RobotLogicClient} from '@/lib/robot-logic/robot-logic';
// import { RobotClient } from '@/lib/robot-client/robotclient';

// local function do not export
function initObject(object, scale, clr, parent_ptr)
{   
    object.scale.multiplyScalar(scale);
    object.traverse( function ( child ) {
        if ( child.isMesh ) {
            child.rotation.set(0, 0, -Math.PI / 2, "XYZ" );
            child.castShadow = true;
            child.receiveShadow = true;
            child.userData.parent = parent_ptr;
            const oldMat = child.material;
            child.material = new MeshLambertMaterial( {  
                color: clr,
                map: oldMat.map
            });
        }
    });
}

export class Robin 
{
  constructor(id, number, ip, port)
  {   
    // main parameters
    this.object = new Group();
    this.object.up = new Vector3(0,0,1);
    this.object["name"] = id;
    this.name = id;

    this.client = new RobotLogicClient(ip, port);
    // this.client = new RobotClient(ip, port);

    this.components =[]
    
    this.events={};
    this.store = useMainStore();
    this.addEventListener("rightClick", this.rightClick.bind(this));

    this.number = number;
    this.battery = 100;

    this.clickable = true;
    this.interactive = true;

    this.frame_ptr = null;

    // load the mesh files
    const loader = new FBXLoader();
    loader.setPath("/static/assets/robin/fbx/");

    // load frame
    loader.load( 'Frame.fbx',  ( object ) => {
        initObject(object, 0.01, 'rgb(40,40,40)', this);
        this.frame_ptr = object.children[0];
        this.object.add( object );
        
    });

    loader.load( 'Cover.fbx',  ( object ) => {
        initObject(object, 0.01, 'red', this);
        this.object.add( object );
    });

    loader.load( 'ConveyorBracket.fbx',  ( object ) => {
        initObject(object, 0.01, 'white', this);
        this.object.add( object );
    });

    loader.load( 'Conveyor.fbx',  ( object ) => {
        initObject(object, 0.01, 'rgb(40,40,40)', this);
        this.object.add( object );
    });

    loader.load( 'HubWheel.fbx',  ( object ) => {
        initObject(object, 0.01, 'gray', this);
        object.rotation.set(0, 0, Math.PI, "XYZ" );
        object.position.set(0.0, 0.24, 0.083);
        this.object.add( object );
    });

    loader.load( 'HubWheel.fbx',  ( object ) => {
        initObject(object, 0.01, 'gray', this);
        object.position.set(0.0, -0.24, 0.083);
        this.object.add( object );
    });

    loader.load( 'Foam.fbx',  ( object ) => {
        initObject(object, 0.01, 'gray', this);
        this.object.add( object );
    });

    
    // Create the LED meshses
    this.front_led = new Mesh(new BoxGeometry(0.15, 0.57, 0.005 ),new MeshBasicMaterial( {color: 'blue', transparent: true, opacity: 1.0} ) );
    this.front_led.position.set(0.4, 0.0, 0.0);
    this.front_led.userData.parent = this;

    this.back_led = new Mesh(new BoxGeometry(0.15, 0.57, 0.005 ),new MeshBasicMaterial( {color: 'blue', transparent: true, opacity: 1.0} ) );
    this.back_led.position.set(-0.4, 0.0, 0.0);
    this.back_led.userData.parent = this;

    // var bbox1 = new Box3().setFromObject(this.object);
    // var bhelp1 = new Box3Helper(bbox1, 0xffff00);
  
    this.object.add(this.front_led);
    this.object.add(this.back_led);

    // create Lidar beams
    const number_of_lidar_beams = 11;
    var lidar_geometry = new BufferGeometry();
    var positions = new Float32Array( number_of_lidar_beams * 3 ); // 3 vertices per point
    lidar_geometry.setAttribute( 'position', new BufferAttribute( positions, 3 ) );
    this.lidar = new Line( lidar_geometry, new LineBasicMaterial( { color: "rgb(255,0,255)" , linewidth: 10} ));
    this.lidar.rotation.set(0, 0, Math.PI/2.0, "XYZ" );
    this.lidar.position.set(0.32, 0.0, 0.15);

    const outer_beam_length_cm = 10;
    const inner_beam_length_cm = 50;
    this.updateLidarBeams([outer_beam_length_cm, 
                           inner_beam_length_cm, 
                           inner_beam_length_cm, 
                           inner_beam_length_cm, 
                           inner_beam_length_cm, 
                           inner_beam_length_cm, 
                           inner_beam_length_cm, 
                           inner_beam_length_cm, 
                           inner_beam_length_cm, 
                           inner_beam_length_cm, 
                           outer_beam_length_cm]
                         );

    this.object.add(this.lidar);
    this.setNumber(number);
  }

  select()
  {
    const oldMat = this.frame_ptr.material;
    this.frame_ptr.material = new MeshLambertMaterial( {  
        color: "yellow",
        map: oldMat.map
    });
    this.selected = true;
  }

  deselect()
  {
    const oldMat = this.frame_ptr.material;
    this.frame_ptr.material = new MeshLambertMaterial( {  
        color: 'rgb(40,40,40)',
        map: oldMat.map
    });
    this.selected = false;
  }

  updateLidarBeams(beams)
  {
      // convert to radians
        var residual_angle = 46.0 * (Math.PI/180.0);

        var positions = this.lidar.geometry.attributes.position.array;
        var j=0;
        // the distances are send in cm
        for (var i=beams.length-1; i >=0; i--)
        {
            var angle = (Math.PI + residual_angle) - ((i*8.8) * (Math.PI/180.0));
            var y = (beams[i]/100) * Math.cos(angle);
            var x = (beams[i]/100) * Math.sin(angle);

            positions[j++] = x;
            positions[j++] = y;
            positions[j++] = 0.0;
        }

        this.lidar.geometry.attributes.position.needsUpdate = true;    
  }

  updateBattery(battery){
    this.battery = battery;
  }
  updateFromStatusMsg(msg)
  {
      this.battery = msg.battery;
      this.can_unlock = msg.can_unlock;
      this.emergency_trigger = msg.emergency_trigger;
      this.is_stationary = msg.is_stationary;
      this.position_locked = msg.position_locked;
      this.weight = msg.weight;
      this.odom = msg.odom;
      this.object.position.set(msg.odom[0], msg.odom[1], 0.0);
      // console.log(msg.odom)
      // this.object.rotateZ(msg.odom[2]);
      this.object.rotation.set( 0.0, 0.0, msg.odom[2], "XYZ" );
      // update state last
      this.motion_state = this.setMotionState(msg.motion_state);
  }
  setLights(front, back)
  {
      this.front_led.material.color.set(front);
      this.back_led.material.color.set(back);
  }
  setMotionState(value)
  {
    if(this.position_locked) this.setLights("green", "blue");
    else this.setLights("purple", "purple");
    if(this.motion_state != value)
    {
        switch (value) 
        {
            case 0: // INIT
            {
              this.setLights("blue", "blue");
              break;
            }
            case 1: // LOCKED
            {
              if(this.position_locked) this.setLights("green", "green");
              else this.setLights("purple", "purple");
              break;
            }
            case 2: // UNLOCKING
            {
              if(this.position_locked) this.setLights("green", "blue");
              else this.setLights("purple", "purple");
              break;
            }
            case 3: // STANDBY
            {
              if(this.position_locked) this.setLights("green", "blue");
              else this.setLights("purple", "purple");
              break;
            }
            case 4: // RUNNING
            {
              if(this.position_locked) this.setLights("green", "blue");
              else this.setLights("purple", "purple");
              break;
            }
            case 5: // ERROR
            {
              this.setLights("red", "red");
              break;
            }
            case 6: // FATAL_ERROR
            {
              this.setLights("red", "red");
              break;
            }
            case 7: // EMERGENCY
            {
              this.setLights("red", "red");
              break;
            }
        }
    }
    this.motion_state = value;
    
  }

  show()
  {
    for(let i=0;i<this.object.children.length; i++)
    {
      this.object.children[i].visible = true;
    }
  }
  hide()
  {
    for(let i=0;i<this.object.children.length; i++)
    {
      this.object.children[i].visible = false;
    }
  }
  toggleFrame()
  {
    for(let i=0;i<this.object.children.length; i++)
    {
      if(this.object.children[i].type !== "Group") continue;
      for(let j=0;j<this.object.children[i].children.length; j++)
      {
        this.object.children[i].children[j].visible =! this.object.children[i].children[j].visible;
      }
    }
  }
  toggleArrow()
  {
    this.arrow.visible = !this.arrow.visible;
  }
  toggleLidar()
  {
    this.lidar.visible = !this.lidar.visible;
  }
  toggleLights()
  {
    this.front_led.visible = !this.front_led.visible;
    this.back_led.visible = !this.back_led.visible;
  }

  toggleWireframe()
  {
    for(let i=0;i<this.object.children.length; i++)
    {
      for(let j=0;j<this.object.children[i].children.length; j++)
      {
        this.object.children[i].children[j].material.wireframe =! this.object.children[i].children[j].material.wireframe;
      }
    }
  }

  setNumber(number, mesh=this.object)
  {
    const loader = new FontLoader();
    var textGeo;
    loader.load( '/static/assets/fonts/helvetiker_bold.typeface.json', function ( font ) {

      textGeo = new TextGeometry( number.toString(), {
        font: font,
        size: 0.3,
        height: 0.01,
      } );

      var text_mesh = new Mesh(textGeo);
      if(number < 10 && number >= 0) text_mesh.position.set(-0.15, 0.13, 1.12); 
      else text_mesh.position.set(-0.15, 0.28, 1.12);
      text_mesh.rotation.set(0, 0, -1.57)
      text_mesh.material.color.set('white');
      text_mesh.userData.parent = this;
      mesh.add(text_mesh);
      
    } );
  }


  setPosition(x, y, theta)
  {
    this.object.position.set(x, y, 0.0);
    this.object.rotation.set(0, 0, theta, "XYZ" );
  }
  //   getPosition()
  //   {
  //     var wp = this.mesh.getWorldPosition();
  //     return [wp.x, wp.y ,wp.z]; 
  //   }
  //   getOrientation()
  //   {
  //     var orientation = new THREE.Euler();
  //     orientation.setFromQuaternion(this.mesh.getWorldQuaternion());
  //     return orientation;
  //   }

  getPosition()
  {
    return this.object.position;
  }

  getOrientation()
  {
    // var orientation = new THREE.Euler();
    // const quaternion = new THREE.Quaternion();
    // this.mesh.getWorldQuaternion(quaternion);
    // orientation.setFromQuaternion(quaternion);
    return this.object.rotation;
  }

  addEventListener(type, func)
  {
    if(type in this.events) this.events[type].push(func);
    else
    {
      this.events[type] = [func];
    }
  }

  dispatchEvent(event_name, parent, mouse=[0,0])
  {
    console.log(event_name)
    if(event_name in this.events)
    {
      for(const func of this.events[event_name])
      {
        console.log(event_name)
        func(parent, mouse);
      }
    }
  }

  getJSON(){
    let json =  [
        {
          key: "Name",
          data: {
            name: "Name",
            value: this.name,
          }
        },

        {
          key: "Battery",
          data: {
            name: "Battery",
            value: this.battery,
          }
        },

        {
          key: "Number",
          data: {
            name: "Number",
            value: this.number,
          }
        },

        {
          key: "State",
          data: {
            name: "State",
            value: this.motion_state,
          }
        },

        {
          key: "WPose",
          data: {
            name: "World Pose",
            value: [Math.floor(this.getPosition().x*100)/100,Math.floor(this.getPosition().y*100)/100, Math.floor(this.getOrientation().z*100)/100],
          }
        },
          
      ];

    return json;
  }

  rightClick()
  {
    
    if(this.store.ToggleRobinWindow()) {
      var json = this.getJSON();
      this.store.setRobinInfo(json);
      this.store.setClient(this.client);
    }
  }


}
