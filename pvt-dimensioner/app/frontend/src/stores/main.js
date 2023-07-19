import { defineStore } from "pinia";
import { useLocalStorage } from "@vueuse/core";

export const useMainStore = defineStore("main", {
  state: () => {
    return {
      sidebar_extended: true,
      sorting_mode: "OFF",
      sorting_paused: true,
      input_status: {},
      notifications: useLocalStorage("notifications", []),

      node_window_visible: false,
      node_info_json: {},

      input_node_window_visible: false,
      input_node_info_json: {},

      direction_window_visible: false,
      direction_info_json: {},
      selected_direction: null,
      block_func: null,
      clear_func: null,

      disable_window_visible: false,
      disable_info: {},
      disable_func: null,

      cell_map: {},

      robin_window_visible: false,
      robin_info_json: {},

      global_cost: {},

      client: null,
      navigation: {},
    };
  },

  actions: {
    toggleSideBar() {
      this.sidebar_extended = !this.sidebar_extended;
    },

    setSortingMode(data) {
      const SORTING_MODES = ["OFF", "INITIALIZING", "SORTING", "HOMING"];
      if (data.mode != null) {
        this.sorting_mode = SORTING_MODES[data.mode];
      }

      if (data.state === "play") this.sorting_paused = false;
      else if (data.state === "pause") this.sorting_paused = true;
      // check if infeed viz needs update
      let need_update_ui = false;

      for (const [key, value] of Object.entries(data.inputs)) {
        if (key in this.input_status) {
          if (value == this.input_status[key]) continue;
          else {
            this.publishInfeedStatus(key, value);
            need_update_ui = true;
          }
        } else this.publishInfeedStatus(key, value);
      }

      this.input_status = data.inputs;

      return need_update_ui;
    },
    simplifySender(sender) {
      const is_server_notification = isNaN(sender);
      if (is_server_notification) {
        return "Server";
      }
      return sender;
    },
    addNotification(notification, description) {
      const entry = {};
      entry["notification"] = notification;
      entry["description"] = [
        { problem: description.problem, solution: description.solution },
      ];
      entry["severity"] = notification.severity;
      const simplified_sender = this.simplifySender(notification.sender);
      entry["title"] = `${simplified_sender}: ${description.title}`;
      entry["time"] = new Date().getTime();
      entry["current_time"] = new Date().getTime();
      this.notifications.push(entry);
      this.updateNotificationInbox();
    },
    updateNotificationInbox() {
      if (this.notifications.length > 8) {
        this.notifications.shift();
      }
    },

    ToggleNodeWindow() {
      this.node_window_visible = !this.node_window_visible;
      return this.node_window_visible;
    },

    setCellMap(json) {
      this.cell_map = json;
    },

    getCellMap() {
      return this.cell_map;
    },

    setNodeInfo(json) {
      this.node_info_json = json;
    },

    getNodeInfo() {
      return this.node_info_json;
    },

    isNodeWindowVisible() {
      return this.node_window_visible;
    },

    ToggleInputNodeWindow() {
      this.input_node_window_visible = !this.input_node_window_visible;
      return this.input_node_window_visible;
    },

    setInputNodeInfo(json) {
      this.fillInGlobalCost(json);
      this.input_node_info_json = json;
    },

    getInputNodeInfo() {
      return this.input_node_info_json;
    },

    isInputNodeWindowVisible() {
      return this.input_node_window_visible;
    },

    ToggleDirectionWindow(){
      this.direction_window_visible = !this.direction_window_visible;
      return this.direction_window_visible;
    },

    setDirectionInfo(json){
      this.direction_info_json = json;
    },

    getDirectionInfo(){
      return this.direction_info_json;
    },

    setBlockFunc(func){
      this.block_func = func;
    },

    getBlockFunc(){
      return this.block_func;
    },

    setClearFunc(func){
      this.clear_func = func;
    },

    getClearFunc(){
      return this.clear_func;
    },

    setDisableFunc(func){
      this.disable_func = func;
    },

    getDisableFunc() {
      return this.disable_func;
    },

    setDisableInfo(json) {
      this.disable_info = json;
    },
    
    getDisableInfo() {
      return this.disable_info;
    },

    ToggleDisableWindow() {
      this.disable_window_visible = !this.disable_window_visible;
      return this.disable_window_visible;
    },

    isDirectionWindowVisible(){
      return this.direction_window_visible;
    },

    ToggleRobinWindow(){
      this.robin_window_visible = !this.robin_window_visible;
      return this.robin_window_visible;
    },

    setRobinInfo(json) {
      this.robin_info_json = json;
    },

    getRobinInfo() {
      return this.robin_info_json;
    },

    isRobinWindowVisible() {
      return this.robin_window_visible;
    },

    setClient(robin) {
      this.client = robin;
    },

    getClient() {
      return this.client;
    },

    setNavigation(navClient) {
      if (navClient != null) this.navigation = navClient;
    },

    getNavigation() {
      return this.navigation;
    },

    getNavigationClient(zone){
      if (!(zone in this.navigation)) return null;

      return this.navigation[zone];
    },

    vizGlobalCost(msg){
      for(var i=0; i<msg.length; i++) this.global_cost[msg[i].id] = msg[i];
    },

    fillInGlobalCost(json) {
      // check if the global cost of this node has value
      if (json[0].data.value in this.global_cost) {
        // Target reservations
        json[1].children[0].data.value =
          this.global_cost[json[0].data.value].nr_target_reservations;
        // Virtual Target Reservations
        json[1].children[1].data.value =
          this.global_cost[json[0].data.value].nr_virtual_target_reservations;
        // Checkins
        json[1].children[2].data.value =
          this.global_cost[json[0].data.value].nr_checkins;
        // Onloaded Parcels
        json[1].children[3].data.value =
          this.global_cost[json[0].data.value].nr_parcels_onloaded;
      }
    },
    getInputStatus() {
      return this.input_status;
    },

    publishInfeedStatus(key, value) {
      let notification = {};
      let description = {};
      switch (value) {
        case true:
          notification = {
            code: 0,
            name: "Enable infeed ",
            sender: key,
            severity: 0,
          };

          description = {
            title: " Resume !",
            problem: "",
            solution: "",
          };

          this.addNotification(notification, description);
          break;

        case false:
          notification = {
            code: 0,
            name: "Disable infeed ",
            sender: key,
            severity: 5,
          };

          description = {
            title: " Paused !",
            problem: "one of infeeds was paused",
            solution:
              "If this operation was done unintended, you can enable this infeed again",
          };

          this.addNotification(notification, description);
          break;
        default:
          break;
      }
    },
  },
});
