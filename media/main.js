// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

var vscode;



function updateStuff(stuff){
    var table = document.getElementById('table');

    table.innerHTML = "<tr><th>Id</th><th>Address</th><th>Type</th><th>Value</th><th>References</th></tr>";
    var status=stuff;
    status=status.split(";");
    for (var i = 0; i < status.length; i++) {
        var str = document.createElement("tr");
        for (var j = 0; j < 5; j++) {
            var cell = document.createElement("td");
            var textocell = document.createTextNode(status[i+j*5]);
            cell.appendChild(textocell);
            str.appendChild(cell);
        }
    }
    table.appendChild(str);

}


function updateStatus(success){
    if(success){
        remote.disabled=false;
        onRemote();

    }else{
        onLocal();
        remote.disabled=true;
        vscode.postMessage({
            command: 'alert',
            text: "Connection failed 🐛"
        });

    }
}

function onRemote() {
    const local = document.getElementById('local');
    const remote = document.getElementById('remote');
    local.checked = false;
    remote.checked = true;
    vscode.postMessage({
        command: 'remote',
    });
};

function onLocal(){
    const local = document.getElementById('local');
    const remote = document.getElementById('remote');
    local.checked = true;
    remote.checked = false;
    vscode.postMessage({
        command: 'local',
    });

};

function onRemoteSettings(){
    const local = document.getElementById('local');
    const remote = document.getElementById('remote');

    var ip=document.getElementById("ip");
    var port=document.getElementById("port");
    var pass=document.getElementById("password");
    var user=document.getElementById("user");
    vscode.postMessage({
        command:'settings',
        ip:"ip",
        port:"port",
        password:"password",
        user:"user"
    });
}

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

    

    setInterval(() => {

        }, 100);
    
    setInterval(() => {
        counter.textContent = currentCount++;}, 100);

        window.addEventListener('message', event => {
            const message = event.data; // The json data that the extension sent
            switch (message.command) {
                case 'refactor':
                    currentCount = Math.ceil(currentCount * 0.5);
                    counter.textContent = currentCount;
                    break;
                case 'data':
                    updateStuff(message.data);
                    break;
                case "status":
                    updateStatus(message.data);
                    break;
            }
        });
        // Handle messages sent from the extension to the webview
        

}());