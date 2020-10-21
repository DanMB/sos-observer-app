import './style.scss';
const { ipcRenderer } = require('electron');


const store = {
  state: {
    isInGame: false,
    players: [],
    target: '',
    ball: {
      x: 0,
      y: 0
    },
    showFrame: false,
    opacity: 85
  },
  setState (data) {

    Object.keys(data).forEach(key => {
      this.state[key] = data[key];
    });
  }
}


new Vue({
  el: '#app',
  data: store.state,
  methods: {

    handleResize(e) {
      if(!map) return;
      var w = map.getBoundingClientRect().width;
      map.style.fontSize = `${w / 12}px`;
    }

  },

  created() {
    
    ipcRenderer.on('state', (e, state) => {
      console.log(state);
      var players = Object.values(state.players);
      store.setState({
        isInGame: true,
        players: players,
        target: state.game.target,
        ball: {
          x: state.game.ballX,
          y: state.game.ballY
        },
      })
    });

    ipcRenderer.on('close', () => {
      console.log('closing');
      store.setState({
        isInGame: false,
        players: [],
        target: '',
        ball: {
          x: 0,
          y: 0
        },
      })
    });

    ipcRenderer.on('vis', (e, arg) => {
      store.setState({
        opacity: arg
      });
    });

    ipcRenderer.on('frame', (e, arg) => {
      console.log(arg);
      store.setState({
        showFrame: arg
      });
    });

    window.addEventListener('resize', this.handleResize);
    this.handleResize();

  },

  beforeDestroy() {
    window.removeEventListener('resize', this.handleResize);
  }
});