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
            value: ['class NameSpace {','\tpublic static void main(String[] args) {','\t\t//Logic here:','\t}','}'].join('\n'),
            language: 'java'
        });
    });
})();


const { ipcRenderer } = require("electron");
var filePath
const fs = require('fs');
const exec = require('child_process').exec;
const languageToFileExtensionMap ={
    'Java' : {
        language : 'java',
        fileExtension : 'java',
        executable : 'java'
    },
    'JavaScript' : {
        language : 'javascript',
        fileExtension : 'js',
        executable : 'node'
    },
    'HTML' : {
        language : 'html',
        fileExtension : 'html',
        executable : undefined
    },
    'Python' : {
        language : 'python',
        fileExtension : 'py',
        executable : 'py'
    }
};


function execute(command, callback) {
    exec(command, (error, stdout, stderr) => { 
        if(stdout){
            callback(stdout); 
        }else if (stderr){
            callback(stderr);
        }else{
            callback(error);
        }
        
    });
};

function getSelectedLanguage (){
    return document.getElementById('cmbLanguageSelector').options[document.getElementById('cmbLanguageSelector').selectedIndex].value;
}

document.getElementById('OpenFile').addEventListener('click',async (e)=>{
    filePath = await ipcRenderer.invoke('showOpenDialog');
    const content = fs.readFileSync(filePath)
    editor.getModel().setValue(content.toString());
});

document.getElementById('cmbLanguageSelector').addEventListener('change',(e)=>{
    const selectedLanguage = getSelectedLanguage();
    filePath = undefined;
    monaco.editor.setModelLanguage(editor.getModel(), languageToFileExtensionMap[selectedLanguage].language);
    if(selectedLanguage == 'Java'){
        editor.getModel().setValue('class NameSpace {\n\tpublic static void main(String[] args) {\n\t\t//Logic here:\n\t}\n}')
    }else{
        editor.getModel().setValue('')
    }
});

document.getElementById('buttonCompile').addEventListener('click',(e)=>{
    const selectedLanguage = getSelectedLanguage();
    if (selectedLanguage == 'HTML'){
        document.getElementById('output').innerHTML= editor.getModel().getValue();
        return;
    }
    if(!filePath){
        ipcRenderer.invoke("showDialog", "save file before compile")
        return
    }
    execute(languageToFileExtensionMap[selectedLanguage].executable.concat(' ').concat(filePath),(output)=>{
        document.getElementById('output').textContent = output;
    });
    
});

document.getElementById('SaveFile').addEventListener('click', async (e) => {
    const selectedLanguage = getSelectedLanguage();

    filePath = await ipcRenderer.invoke("showSaveDialog", editor.getModel().getValue(), languageToFileExtensionMap[selectedLanguage].language, languageToFileExtensionMap[selectedLanguage].fileExtension);
});