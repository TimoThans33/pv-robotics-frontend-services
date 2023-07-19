



export class RobotLogicClient
{
  constructor(ip, port) 
  { 
    this.ip = ip;
    this.port = port;
    this.url = `http://${ip}:${port}`;
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


  async getSettings()
  {
    return await this.get_("/settings");
  }

  async setSettings(msg)
  {
    return await this.post_("/settings", msg);
  }

  async setPosition(x, y, theta)
  {
    console.log("setting position")
    console.log(this.ip, this.port)
    return await this.post_("/set_position", [x, y, theta]);
  }
  async setDirection(cell, direction, barcode)
  {
    var msg = {"cell_id": cell, "direction": direction, "payload_id":barcode};
    return await this.post_("/set_direction",msg);
  }

  async reset()
  {
    return await this.get_("/reset");
  }

  async disable()
  {
    return await this.get_("/disable");
  }
  
  async resolveExceptions()
  {
    return await this.get_("/resolve_exceptions");
  }

  async zeroScale()
  {
    return await this.get_("/zero_scale");
  }
  async play()
  {
    return await this.get_("/play");
  }

  async pause()
  {
    return await this.get_("/pause");
  }

  async setDropoffDetectionThreshold(value)
  {
    var msg = {"dropoff_detection_threshold": value};
    return await this.post_("/settings", msg);
  }

  async setPayloadDetection(value)
  {
    var msg = {"payload_detection": value};
    return await this.post_("/settings", msg);
  }

  async showCorridor()
  {
    var msg = {"visualize_corridor": true};
    return await this.post_("/settings", msg);
  }
  async hideCorridor()
  {
    var msg = {"visualize_corridor": false};
    return await this.post_("/settings", msg);
  }

  async showTrajectory()
  {
    var msg = {"visualize_trajectory": true};
    return await this.post_("/settings", msg);
  }
  async hideTrajectory()
  {
    var msg = {"visualize_trajectory": false};
    return await this.post_("/settings", msg);
  }

  async setPauseBroadcasting(value)
  {
    var msg = {"broadcast_pause": value};
    return await this.post_("/settings", msg);
  }

  async setLidarAutoPlay(value)
  {
    var msg = {"lidar_auto_play": value};
    return await this.post_("/settings", msg);
  }

  async setOffloadFinished()
  {
    var msg = {"offload_state": "finished"};
    return await this.post_("/offload", msg);
  }

  async setOffloadCancelled()
  {
    var msg = {"offload_state": "cancelled"};
    return await this.post_("/offload", msg);
  }

  async getOffloadStatus()
  {
    return await this.get_("/offload");
  }
}