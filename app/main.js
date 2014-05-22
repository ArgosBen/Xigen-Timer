var app = require('app');
var Menu = require('menu');
var MenuItem = require('menu-item');
var BrowserWindow = require('browser-window');

var mainWindow = null;
var menu = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  app.quit();
});

app.on('ready', function() {
    app.commandLine.appendSwitch('js-flags', '--harmony_collections');

    var height = 600;

    if (process.platform == 'win32')
        height += 60;
    else if (process.platform == 'linux')
        height += 30;

    mainWindow = new BrowserWindow({ 
        "title": "Xigen Timer",
        "width": 1000,
        "height": 600,
        "max-width": 1000,
        "max-height": 600,
        "min-width": 1000,
        "min-height": 600,
        "frame": false
    });
    mainWindow.loadUrl('file://' + __dirname + '/index.html');

});