export class FippClient {
  constructor(name, ip = "127.0.0.1", port = 4032) {
    this.name = name;
    this.ip = ip;
    this.port = port;
    this.url = `http://${ip}:${port}`;
  }

  async post_(url, msg) {
    try {
      return await fetch(`http://${this.ip}:${this.port}${url}`, {
        mode: "cors",
        method: "POST",
        body: JSON.stringify(msg),
        headers: {
          "Access-Control-Allow-Origin": `http://${this.ip}:${this.port}`,
        },
      }).then((res) => res.json());
    } catch (err) {
      console.log(err);
    }
  }

  async get_(url) {
    try {
      return await fetch(`http://${this.ip}:${this.port}${url}`, {
        method: "GET",
        mode: "cors",
        headers: {
          "Access-Control-Allow-Origin": `http://${this.ip}:${this.port}`,
        },
      }).then((res) => res.json());
    } catch (err) {
      console.log(err);
    }
  }

  async getNodes(msg = null) {
    if (msg == null) {
      return await this.get_("/nodes");
    }
    return await this.post_("/nodes", { nodes: msg });
  }

  async setWalkability(node, value) {
    let msg = {};
    msg["nodes"] = {};
    msg["nodes"][node] = { walkable: value };
    return await this.post_("/settings", msg);
  }

  async manualBlock(nodes) {
    let msg = {};
    msg["nodes"] = {};
    for (const node of nodes) {
      msg["nodes"][node] = { walkable: false, owner: "manual" };
    }
    return await this.post_("/settings", msg);
  }

  async clearNodes(nodes) {
    let msg = {};
    msg["nodes"] = {};
    for (const node of nodes) {
      msg["nodes"][node] = { walkable: true, owner: "" };
    }

    return await this.post_("/settings", msg);
  }
}
