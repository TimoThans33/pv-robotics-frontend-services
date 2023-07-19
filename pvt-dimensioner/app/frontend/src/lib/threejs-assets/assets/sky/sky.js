import * as THREE from '../../../thirdparty/threejs/three.module.js';
import {Window} from '../../../common/windows.js';


export class Sky 
{
  constructor(name="sky") 
  { 
    this.name = name;

    var vertexShader = `varying vec3 vWorldPosition;

    void main() {
    
      vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
      vWorldPosition = worldPosition.xyz;
    
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    
    }`;
    var fragmentShader =`uniform vec3 topColor;
    uniform vec3 bottomColor;
    uniform float offset;
    uniform float exponent;
    
    varying vec3 vWorldPosition;
    
    void main() {
    
      float h = normalize( vWorldPosition + offset ).z;
      gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h, 0.0 ), exponent ), 0.0 ) ), 1.0 );
    
    }`;

    var uniforms = {
      topColor: { value: new THREE.Color( 0x0077ff ) },
      bottomColor: { value: new THREE.Color( 0xffffff ) },
      offset: { value: 400 },
      exponent: { value: 0.6 }
    };
    // console.log(this.light.color);
    var top_color = new THREE.Color( 'skyblue' );
    uniforms.topColor.value.copy( top_color );

    var skyGeo = new THREE.SphereBufferGeometry( 1000, 32, 15 );
    var skyMat = new THREE.ShaderMaterial( {
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.BackSide
    } );

    this.mesh = new THREE.Mesh( skyGeo, skyMat );
    this.mesh.name = name;
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

  click(point=[0.0,0.0], mouse={x: 0, y: 0})
  {
    // this.window.open("home");
  }
}
