

class Communication
{
  constructor(url) 
  {  
    this.url = url;

    this.subscribers = [];

    this.connected = false;
    this.reconnect();


  }

  clear()
  {
    this.subscribers = [];
  }

  reconnect()
  {
    if(this.connected) this.close();

    this.sock = new WebSocket(this.url);


    this.sock.onopen = ()=>{ 
      clearInterval(this.auto_reconnect);
      console.log('text socket open') 
    };
    this.sock.onerror = (e)=>{ console.log('text socket error') }
    this.sock.onclose = ()=>{ 
      this.connected = false; 
      console.log('text socket close')
          // check every 10 seconds if connection is gone and try to reconnect
      this.auto_reconnect = setInterval(() => {
        if(!this.connected) 
        {
          this.reconnect();
        }
      }, 10000);
    };
    this.sock.onmessage = (e)=>{
        for (const subscriber of this.subscribers)
        {
            subscriber(e.data);
        }
    }

    this.connected = true;
  }


  close()
  {
    this.sock.close();
    this.connected = false;
  }

  subscribe(subscriber)
  {
    this.subscribers.push(subscriber);
  }

}


export class RobotClient
{
  constructor(ip, port) 
  { 
    this.ip = ip;
    this.port = port;
    this.url = `http://${ip}:${port}`;
    this.stream = new Communication(`ws://${ip}:${port}/stream`);
    this.meta = new Communication(`ws://${ip}:${port}/meta`);
    this.status = new Communication(`ws://${ip}:${port}/status`);
    this.extrastatus = new Communication(`ws://${ip}:${port}/extrastatus`);
    this.sensors = new Communication(`ws://${ip}:${port}/sensors`);
    this.events = new Communication(`ws://${ip}:${port}/events`);
    this.notifications = new Communication(`ws://${ip}:${port}/notifications`);
  }

  reconnect()
  {
    this.stream.reconnect();
    this.meta.reconnect();
    this.status.reconnect();
    this.extrastatus.reconnect();
    this.sensors.reconnect();
    this.events.reconnect();
    this.notifications.reconnect();
  }

  subscribeStream(subscriber)
  {
    this.stream.subscribe(subscriber);
  }
  clearStreamSubscribers()
  {
    this.stream.clear();
  }
  subscribeMeta(subscriber)
  {
    this.meta.subscribe(subscriber);
  }
  clearMetaSubscribers()
  {
    this.meta.clear();
  }
  subscribeStatus(subscriber)
  {
    this.status.subscribe(subscriber);
  }
  clearStatusSubscribers()
  {
    this.status.clear();
  }
  subscribeExtraStatus(subscriber)
  {
    this.extrastatus.subscribe(subscriber);
  }
  clearExtraStatusSubscribers()
  {
    this.extrastatus.clear();
  }
  subscribeSensors(subscriber)
  {
    this.sensors.subscribe(subscriber);
  }
  clearSensorsSubscribers()
  {
    this.sensors.clear();
  }
  subscribeEvents(subscriber)
  {
    this.events.subscribe(subscriber);
  }
  clearEventsSubscribers()
  {
    this.events.clear();
  }
  subscribeNotifications(subscriber)
  {
    this.notifications.subscribe(subscriber);
  }
  clearNotificationsSubscribers()
  {
    this.notifications.clear();
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


  async home()
  {
    return await this.get_("/robotclient");
  }
  async getMetaData()
  {
    return await this.get_("/robotclient/getMetaData");
  }
  async getVersion()
  {
    return await this.get_("/robotclient/getVersion");
  }
  async getMotionState()
  {
    return await this.get_("/robotclient/getMotionState");
  }
  async canUnlock()
  {
    return await this.get_("/robotclient/canUnlock");
  }
  async positionLocked()
  {
    return await this.get_("/robotclient/positionLocked");
  }
  async isStationary()
  {
    return await this.get_("/robotclient/isStationary");
  }
  async isConveyorOn()
  {
    return await this.get_("/robotclient/isConveyorOn");
  }
  async payloadDetected()
  {
    return await this.get_("/robotclient/payloadDetected");
  }
  async isLidarTriggered()
  {
    return await this.get_("/robotclient/isLidarTriggered");
  }
  async isEmergencyOn()
  {
    return await this.get_("/robotclient/isEmergencyOn");
  }
  async getErrorCode()
  {
    return await this.get_("/robotclient/getErrorCode");
  }

  async lock()
  {
    return await this.get_("/robotclient/lock");
  }
  async unlock()
  {
    return await this.get_("/robotclient/unlock");
  }
  async cancelTask()
  {
    return await this.get_("/robotclient/cancelTask");
  }
  async releaseError()
  {
    return await this.get_("/robotclient/releaseError");
  }
  async setPosition(pose)
  {
    return await this.post_("/api/machine/robots/position", pose);
  }
  async reset()
  {
    return await this.get_("/robotclient/reset");
  }
  async triggerEStop()
  {
    return await this.get_("/robotclient/triggerEstop");
  }
  async startManualControlTask()
  {
    return await this.get_("/robotclient/startManualControlTask");
  }
  async setManualCommands(commands)
  {
    return await this.post_("/robotclient/setManualCommands", commands);
  }
  async executeTrajectory(trajectory)
  {
    return await this.post_("/robotclient/executeTrajectory", trajectory);
  }
  async turnOnConveyor()
  {
    return await this.get_("/robotclient/turnOnConveyor");
  }
  async turnOffConveyor()
  {
    return await this.get_("/robotclient/turnOffConveyor");
  }
  async setLights(value)
  {
    return await this.post_("/robotclient/setLights", value);
  }
  async resetLights()
  {
    return await this.setLights(126)
  }
  async playSound(value)
  {
    return await this.post_("/robotclient/playSound", value);
  }
  async zeroScale()
  {
    return await this.get_("/robotclient/zeroScale");
  }
  async setLcdMessage(value)
  {
    return await this.post_("/robotclient/setLcdMessage", value);
  }
  async removeLcdMessage(value)
  {
    return await this.post_("/robotclient/removeLcdMessage", value);
  }


  async calibrateScale(value)
  {
    return await this.post_("/robotclient/calibrateScale", value);
  }


  async getPose()
  {
    return await this.get_("/robotclient/getPose");
  }
  async getTwist()
  {
    return await this.get_("/robotclient/getTwist");
  }
  async getPayloadWeight()
  {
    return await this.get_("/robotclient/getPayloadWeight");
  }
  async getBatteryPercentage()
  {
    return await this.get_("/robotclient/getBatteryPercentage");
  }

}