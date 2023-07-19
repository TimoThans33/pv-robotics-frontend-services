



export class QBDs
{
  constructor(ip, port, input_cells=[], barcode = "") 
  { 
    this.ip = ip;
    this.port = port;
    this.url = `http://${ip}:${port}`;
    this.input_cells = input_cells;
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

  async setTarget(direction, cell_id="", barcode="")
  {
    var msg = {};
    msg["cell_id"] = cell_id;
    msg["direction"] = direction;
    msg["barcode"] = barcode;

    return await this.post_("/set_direction",msg)
  }

  async addInputCell(cell_id)
  {
    this.input_cells.push(cell_id);
  }

  async getCellMap(){
    return await this.get_("/cellmap");
  }

  async getNavigation(){
    return await this.get_("/fipp");
  }


}