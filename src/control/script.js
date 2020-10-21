// import Vue from 'vue/dist/vue.min.js';
import './style.scss';
const { ipcRenderer } = require('electron');

const previewState = {
  event: 'gamestate',
  players: {
    ViolentPanda_1: {
      boost: 100,
      id: "ViolentPanda_1",
      isDead: false,
      name: "ViolentPanda",
      team: 1,
      x: -1500,
      y: 0,
      z: 0,
      yaw: 180
    },
    Kaydop_2: {
      boost: 17,
      id: "Kaydop_2",
      isDead: false,
      name: "Kaydop",
      team: 1,
      x: 3500,
      y: 1500,
      z: 500,
      yaw: 50
    },
    Squishymuffinz_5: {
      boost: 33,
      id: "Squishymuffinz_5",
      isDead: false,
      name: "Squishymuffinz",
      team: 0,
      x: 500,
      y: -2500,
      z: 0,
      yaw: 230
    },
    Torment_6: {
      boost: 81,
      id: "Torment_6",
      isDead: false,
      name: "Torment",
      team: 0,
      x: -825,
      y: 2600,
      z: 0,
      yaw: 90
    },
  },
  game: {
    ballTeam: 1,
    ballX: 1700,
    ballY: 1000,
    ballZ: 800,
    target: "Kaydop_2",
  },
  hasGame: true
};

const store = {
  state: {
    isConnected: false,
  },
  setState (data) {

    Object.keys(data).forEach(key => {
      this.state[key] = data[key];
    });
  }
}

var isConnected = false;


const connectWS = () => {
  var socket = new WebSocket("ws://127.0.0.1:49122/");

  socket.onopen = (event) => {
    console.log('Socket connected');
    isConnected = true;
  }
  
  socket.onclose = (event) => {
    console.log('Socket closed');

    if(store.state.isConnected) {
      isConnected = false
      ipcRenderer.send('sos:close');
    }

    setTimeout(() => {
      connectWS();
    }, 5000);
  }

  socket.onmessage = (string) => {
    var json = {};
    try {
      json = JSON.parse(string.data);
    } catch (e) {
      try {
          json = JSON.parse(atob(string.data));
      } catch (e) {
          json = string.data;
      }
    }

    if(typeof json === 'object' && json !== null) {
      if(json.event === 'game:update_state') {
        ipcRenderer.send('state:', json.data);
      } else if(json.event === 'game:match_destroyed') {
        ipcRenderer.send('close:');
      }
    }
  };
}


new Vue({
  el: '#app',
  data: {
    isConnected: isConnected
  },
  methods: {

    changeOpacity(e) {
      ipcRenderer.send('vis:', parseFloat(e.target.value));
    },

    togglePreview(e) {
      if(e.target.checked) {
        console.log(previewState);
        ipcRenderer.send('state:', previewState);
      } else {
        ipcRenderer.send('close:');
      }
    },

    toggleFrame(e) {
      console.log(e.target.checked);
      ipcRenderer.send('frame:', e.target.checked);
    }
  },
  created() {

    connectWS();

  }
});