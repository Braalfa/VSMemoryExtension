// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

var vscode;

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
                    updateStuff(message.text);
                    break;
            }
        });
        // Handle messages sent from the extension to the webview
        

}());