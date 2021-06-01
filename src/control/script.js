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
      location: {
        X: -1500,
        Y: 0,
        Z: 0,
      },
      yaw: 180
    },
    Kaydop_2: {
      boost: 17,
      id: "Kaydop_2",
      isDead: false,
      name: "Kaydop",
      team: 1,
      location: {
        X: 3500,
        Y: 1500,
        Z: 500,
        yaw: 50
      },
    },
    Squishymuffinz_5: {
      boost: 33,
      id: "Squishymuffinz_5",
      isDead: false,
      name: "Squishymuffinz",
      team: 0,
      location: {
        X: 500,
        Y: -2500,
        Z: 0,
        yaw: 230
      },
    },
    Torment_6: {
      boost: 81,
      id: "Torment_6",
      isDead: false,
      name: "Torment",
      team: 0,
      location: {
        X: -825,
        Y: 2600,
        Z: 0,
        yaw: 90
      },
    },
  },
  game: {
    ball: {
      location: {
        X: 1700,
        Y: 1000,
        Z: 800,
      },
    },
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

var data = { isConnected: false }


const connectWS = () => {
  var socket = new WebSocket("ws://127.0.0.1:49122/");

  socket.onopen = (event) => {
    console.log('Socket connected');
    data.isConnected = true;
  }
  
  socket.onclose = (event) => {
    console.log('Socket closed');

    if(store.state.isConnected) {
      data.isConnected = false;
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
  data: data,
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