// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

var vscode;

/**
 * Funcion para actualizar tabla del webview
 * @param {} stuff String con informacion actualizada
 */
function updateStuff(stuff){
    table.innerHTML = "<tr><th>Id</th><th>Address</th><th>Type</th><th>Value</th><th>References</th></tr>";
    var status=stuff;
    status=status.split(";");
    for (var i = 0; i < status.length/5-1; i++) {
        var str = document.createElement("tr");
        for (var j = 0; j < 5; j++) {
            var cell = document.createElement("td");
            var textocell = document.createTextNode(status[5*i+j]);
            cell.appendChild(textocell);
            str.appendChild(cell);
        }
        table.appendChild(str);
    }
}


/**
 * Funcion para establecer las configuraciones remotas
 */
function onRemote() {
    const local = document.getElementById('local');
    const remote = document.getElementById('remote');
    local.checked = false;
    remote.checked = true;
    vscode.postMessage({
        command: 'remote',
    });
};


/**
 * Funcion para establecer las configuraciones locales
 */
function onLocal(){
    const local = document.getElementById('local');
    const remote = document.getElementById('remote');
    local.checked = true;
    remote.checked = false;
    vscode.postMessage({
        command: 'local',
    });

};

/**
 * Funcion para establecer los settings del cliente 
 */
function onRemoteSettings(){
    const local = document.getElementById('local');
    const remote = document.getElementById('remote');
    remote.disabled=false;
    var ip=document.getElementById("ip");
    var port=document.getElementById("port");
    var pass=document.getElementById("password");
    var user=document.getElementById("user");
    var send =ip.value+"\n"+port.value+"\n"+user.value+"\n"
    +pass.value;

    vscode.postMessage({
        command:'settings',
        text: send.toString()
    });
}


/**
 * Funcion principal para asignar funciones a los botones y para establecer un listener
 * de los cambios en el Garbage Collector
 */
(function () {


    vscode = acquireVsCodeApi();

    const oldState = vscode.getState();

    const counter = document.getElementById('lines-of-code-counter');
    console.log(oldState);
    let currentCount = (oldState && oldState.count) || 0;
    counter.textContent = currentCount;

    const local = document.getElementById('local');
    const remote = document.getElementById('remote');
    const settings=document.getElementById("setsettings");
    
    local.onclick=onLocal;
    remote.onclick=onRemote;
    settings.onclick=onRemoteSettings;
    
    var table = document.getElementById('table');

        window.addEventListener('message', event => {
            const message = event.data; // The json data that the extension sent
            switch (message.command) {
                case 'refactor':
                    currentCount = Math.ceil(currentCount * 0.5);
                    counter.textContent = currentCount;
                    break;
                case 'data':
                    updateStuff(message.text);
                    break;
            }
        });
        // Handle messages sent from the extension to the webview
        

}());