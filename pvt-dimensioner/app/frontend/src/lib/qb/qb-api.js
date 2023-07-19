

export class Communication
{
  constructor(ip, port) 
  {  
    this.ip = ip;
    this.port = port;

    this.text_subscribers = {};
    this.bin_subscribers = {};

    this.bin_interval_set = false;
    this.interval_set = false;

    this.connected = false;
    this.reconnectSocket();
    this.reconnectBinarySocket();




    // close the connection when window is closed (or refreshed)
    // window.addEventListener('beforeunload', () => {
    //   this.close();
    // }, false);
  }


  reconnectSocket()
  {
    // close connections first
    if(this.sock) this.sock.close();
    this.connected = false;

    this.sock = new WebSocket(`ws://${this.ip}:${this.port}/ws`);


    this.sock.onopen = ()=>{ 
      this.connected = true;
      clearInterval(this.auto_reconnect);
      this.interval_set = false;
      console.log('text socket open') 
    };
    this.sock.onerror = (e)=>{ console.log('text socket error') }
    this.sock.onclose = ()=>{ 
      this.connected = false; 
      console.log("text socket closed")
      if(!this.interval_set)
      {
        clearInterval(this.auto_reconnect);
        this.auto_reconnect = setInterval(() => {
            this.reconnectSocket();
        }, 5000);
        this.interval_set = true;
      }

    };
    this.sock.onmessage = (e)=>{
      var msg = JSON.parse(e.data);
      if(msg.topic in this.text_subscribers) this.text_subscribers[msg.topic](msg.value, msg.description);
    }
  }


  reconnectBinarySocket()
  {
    if(this.bin_sock) this.bin_sock.close();
    this.bin_connected = false;

    this.bin_sock = new WebSocket(`ws://${this.ip}:${this.port}/wsbin`);
    this.bin_sock.binaryType = 'arraybuffer';

    this.bin_sock.onopen = ()=>{ 
      this.bin_connected = true;
      clearInterval(this.bin_auto_reconnect);
      this.bin_interval_set = false;
      console.log('binary socket open');
    };
    this.bin_sock.onerror = (e)=>{ console.log('binary socket error')}
    this.bin_sock.onclose = ()=>{ 
      this.bin_connected = false; 
      console.log("binary socket closed")
      if(!this.bin_interval_set)
      {
        clearInterval(this.bin_auto_reconnect);
        this.bin_auto_reconnect = setInterval(() => {
            this.reconnectBinarySocket();
        }, 5000);
        this.bin_interval_set = true;
      }
    };
    this.bin_sock.onmessage = (e)=>{
      var dv = new DataView(e.data);
      // first byte is message type. Pass arraybuffer to function
      var idx = dv.getInt8(0);
      if (this.bin_subscribers[idx] !== undefined) 
      {
        this.bin_subscribers[idx](e.data.slice(1));
      }
    }
  }


  close()
  {
    if(this.sock) this.sock.close();
    if(this.bin_sock) this.bin_sock.close();
    this.connected = false;
    this.bin_connected = false;
  }

  subscribe(topic, subscriber)
  {
    console.log("subscribing to " + topic)
    this.text_subscribers[topic] = subscriber;
  }

  subscribeBinary(msg_type, subscriber)
  {
    this.bin_subscribers[msg_type] = subscriber;
  }


}


export class QBApi
{
  constructor(ip, port) 
  { 
    this.ip = ip;
    this.port = port;
    this.url = `http://${ip}:${port}`;
    this.ws = new Communication(ip, port);
  }

  reconnect()
  {
    this.ws.reconnect();
  }

  responseHandler(data)
  {
    console.log(data);
  }

  subscribe(topic, subscriber)
  {
    this.ws.subscribe(topic, subscriber);
  }

  subscribeBinary(msg_type, subscriber)
  {
    this.ws.subscribeBinary(msg_type, subscriber);
  }

  async post_(url, msg)
  {  
    try 
    {
      return await fetch(`http://${this.ip}:${this.port}${url}`, {
        mode: 'cors',
        method: 'POST',
        body: JSON.stringify(msg),
        headers: {
          'Access-Control-Allow-Origin':`http://${this.ip}:${this.port}`,
        }
      }).then(res => res.json());
    } 
    catch (err) 
    {
      console.log(err)
    }
  }

  async get_(url)
  {    
    try 
    {
      return await fetch(`http://${this.ip}:${this.port}${url}`, {
        method: 'GET',
        mode: 'cors',
        headers: {
          'Access-Control-Allow-Origin':`http://${this.ip}:${this.port}`,
        }
      }).then( res => res.json());
    } 
    catch (err) 
    {
      console.log(err);
    }
  }

  async getDesign()
  {
    return await this.get_("/api/machine/design");
  }

  async setDesign(design)
  {
    return await this.post_("/api/machine/design", design);
  }
  async getDesignPatch()
  {
    return await this.get_("/api/machine/design/patch");
  }

  async setDesignPatch(patch)
  {
    return await this.post_("/api/machine/design/patch", patch);
  }

  async setControls(cmd)
  {
    return await this.post_("/api/machine/controls", {"command":cmd});
  }

  async deactivate(robot)
  {
    return await this.post_("/api/machine/robots/deactivate", {"robots" : [robot]});
  }

  async setPosition(robot, pose)
  {
    var msg = {};
    msg[robot] = pose;
    return await this.post_("/api/machine/robots/position", msg);
  }

  async setWalkability(node, value)
  {
    var msg = {"nodes":[{"id": node, "walkable": value}]};
    return await this.post_("/api/machine/navigation/cells/walkability", msg);
  }

  async getZone(zone_id)
  {
    var msg = {};
    msg["zone_id"] = zone_id;
    return await this.post_("/api/machine/navigation/zone", msg);
  }

}