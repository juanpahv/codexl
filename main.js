const { app, BrowserWindow } = require('electron');
const path = require('path');
const { ipcMain, dialog } = require("electron");
const fs = require('fs');

let mainWindow;

ipcMain.handle("showSaveDialog", async (e, message, fileType, fileExtension) => {
	const savedDialog = dialog.showSaveDialog({
        title: 'Select the File Path to save',
        defaultPath: path.join('C:/Users/%USERPROFILE%/*.',fileExtension),
        buttonLabel: 'Save',
        filters: [
            {
                name: fileType,
                extensions: [fileExtension]
            }, ],
        properties: []
    }).then(file => {
        if (!file.canceled) {
            console.log(file.filePath.toString());
            fs.writeFile(file.filePath.toString(), 
                         message, function (err) {
                if (err) throw err;
            });
        }
		return file.filePath.toString();
    }).catch(err => {
        console.log(err)
    });
	return savedDialog;
});

ipcMain.handle("showDialog", async (e, message) => {
	dialog.showMessageBox(mainWindow, {message});
});


function createWindow() {
	mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			worldSafeExecuteJavaScript: true,
			enableRemoteModule: true,
			contextIsolation: false,
			webSecurity: false
		}
	});
	mainWindow.loadURL(`file://${__dirname}/electron-index.html`);
	mainWindow.webContents.openDevTools();
	mainWindow.on('closed', function () {
		mainWindow = null;
	});
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', function () {
	if (mainWindow === null) {
		createWindow();
	}
});

