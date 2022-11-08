var editor;

(function () {
    const path = require('path');
    const amdLoader = require('./node_modules/monaco-editor/min/vs/loader.js');
    const amdRequire = amdLoader.require;
    const amdDefine = amdLoader.require.define;
    
    function uriFromPath(_path) {
        var pathName = path.resolve(_path).replace(/\\/g, '/');
        if (pathName.length > 0 && pathName.charAt(0) !== '/') {
            pathName = '/' + pathName;
        }
        return encodeURI('file://' + pathName);
    }
    amdRequire.config({
        baseUrl: uriFromPath(path.join(__dirname, './node_modules/monaco-editor/min'))
    });
    // workaround monaco-css not understanding the environment
    self.module = undefined;
    amdRequire(['vs/editor/editor.main'], function () {
        editor = monaco.editor.create(document.getElementById('container'), {
            value: [''].join('\n'),
            language: 'java'
        });
    });
})();

// const electron = require('electron')
const { ipcRenderer } = require("electron");
var filePath
const fs = require('fs');
const exec = require('child_process').exec;
// const dialog = electron.remote.dialog;

// console.log(dialog);
function execute(command, callback) {
    exec(command, (error, stdout, stderr) => { 
        callback(stdout); 
    });
};


document.getElementById('buttonCompile').addEventListener('click',(e)=>{
    if(!filePath){
        ipcRenderer.invoke("showDialog", "save file before compile")
        return
    }
    const filename = filePath.replace(/^.*[\\\/]/, '');
    console.log(filePath.replace(filename,''));
    execute('cd '.concat(filePath.replace(filename,'')),(output)=>{});
    //TODO deharde-code for java
    execute('ping google.com', (output) => {
        console.log(output);
    });
    execute('java '.concat(filename),(output)=>{
        console.log(output);
    });
});

document.getElementById('SaveFile').addEventListener('click', async (e) => {
    filePath = await ipcRenderer.invoke("showSaveDialog", editor.getModel().getValue(), 'Java','java');
});