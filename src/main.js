const { app, BrowserWindow, screen, Menu, ipcMain } = require('electron');


let dashboardWindow;
let overlayWindow;


const window = ({
  file,
  height,
  width,
  x = 0,
  y = 0,
  isOverlay = false,
}) => {

  const wnd = new BrowserWindow({
    height: height,
    width: width,
    useContentSize: true,
    frame: !isOverlay,
    transparent: isOverlay,
    skipTaskbar: isOverlay,
    minimizable: !isOverlay,
    maximizable: false,
    closable: !isOverlay,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      worldSafeExecuteJavaScript: true,
      // contextIsolation: true
    }
  });

  wnd.loadFile(file+'.html');

  if(isOverlay) {
    wnd.setIgnoreMouseEvents(true);
    wnd.setAlwaysOnTop(true, 'screen');
  }

  if(x+y > 0) {
    wnd.hide();
    wnd.once('ready-to-show', () => {
      wnd.setPosition(x, y);
      wnd.show();
    });
  }

  wnd.on('closed', () => {app.exit();});

  return wnd;
}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  var map;

  Menu.setApplicationMenu(Menu.buildFromTemplate([
    {
      label: "&debug",
      submenu : [
        { role: "toggleDevTools" },
        { role : "forceReload" },
        { type: "separator" },
        {
          label: "Reload Overlay",
          click: () => {
            if(map) map.webContents.reloadIgnoringCache();
          }
        }
      ]
    }
  ]));

  window({
    file: 'control',
    height: 150,
    width: 275,
  });


  const bounds = screen.getPrimaryDisplay().bounds;
  var scale = bounds.height * .03906;
  var height = Math.round(8.24 * scale);

  map = window({
    file: 'map',
    height: height,
    width: Math.round(10.28 * scale),
    x: bounds.x,
    y: bounds.y + (bounds.height - height),
    isOverlay: true,
  });

  ipcMain.on('state:', (e, arg) => {
    if(map) map.webContents.send('state', arg);
  });
  
  ipcMain.on('close:', e => {
    if(map) map.webContents.send('close');
  });
  
  ipcMain.on('vis:', (e, arg) => {
    if(map) map.webContents.send('vis', arg);
  });
  
  ipcMain.on('frame:', (e, arg) => {
    if(map) {
  
      map.setIgnoreMouseEvents(!arg);
      map.setSkipTaskbar(!arg);
  
      map.webContents.send('frame', arg);
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {app.quit();});