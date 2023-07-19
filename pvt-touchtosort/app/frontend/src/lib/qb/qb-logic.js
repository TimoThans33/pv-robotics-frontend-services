export class QBLogic {
  constructor(ip, port) {
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

  async pause() {
    return await this.get_("/pause");
  }
  async play() {
    return await this.get_("/play");
  }
  async getAvailableRobots() {
    return await this.get_("/robots");
  }
  async getEnabledRobots() {
    return await this.get_("/enabled_robots");
  }

  async setSimulationMode(mode) {
    let msg = { simulation_mode: mode };
    return await this.post_("/settings", msg);
  }

  async deactivateRobot(robot) {
    console.log("deactivating");
    return await this.post_("/robots/deactivate", { robots: [robot] });
  }

  async getInputs() {
    return await this.get_("/play");
  }
  async setInputStatus(input, status) {
    let msg = {};
    msg[input] = status;
    return await this.post_("/input", msg);
  }
  async setMode(mode) {
    let msg = { mode: mode };
    return await this.post_("/mode", msg);
  }
  async setHomingMode() {
    this.setMode(3);
  }
  async setOffMode() {
    this.setMode(0);
  }
  async setSortingMode() {
    this.setMode(2);
  }
  async setInitMode() {
    this.setMode(1);
  }
  async enableInput(node) {
    let msg = {};
    msg[node] = true;
    return await this.post_("/inputs", msg);
  }

  async disableInput(node) {
    let msg = {};
    msg[node] = false;
    return await this.post_("/inputs", msg);
  }

  async getSortStartTime() {
    return await this.get_("/sort-start-timestamp");
  }
}
