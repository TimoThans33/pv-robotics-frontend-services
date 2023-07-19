



export class QBStorage
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

  async getFloorplan()
  {
    return await this.get_("/floorplan");
  }
  async getDevices()
  {
    return await this.get_("/devices");
  }
  async getSortplan()
  {
    return await this.get_("/sortplan");
  }

  async getDevice(id)
  {
    let msg = {"id": id};
    return await this.post_("/devices", msg);
  }

}