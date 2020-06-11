// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.

var vscode;

function onRemote() {
    const local = document.getElementById('local');
    const remote = document.getElementById('remote');

    local.checked = false;
    remote.checked = true;
};

function onLocal(){
    const local = document.getElementById('local');
    const remote = document.getElementById('remote');

    local.checked = true;
    remote.checked = false;

};

function onRemoteSettings(){
    const local = document.getElementById('local');
    const remote = document.getElementById('remote');

    var ip=document.getElementById("ip");
    var port=document.getElementById("port");
    var pass=document.getElementById("password");
    var user=document.getElementById("user");

    var success=false;

    if(false){
        remote.disabled=false;
        onRemote();
        vscode.postMessage({
            text: "Connection succesful"
        });
    }else{
        onLocal();
        remote.disabled=true;
        vscode.postMessage({
            command: 'alert',
            text: "Connection failed 🐛"
        });
    }
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
        table.innerHTML = "<tr><th>Id</th><th>Address</th><th>Type</th><th>Value</th><th>References</th></tr>";
        var status="1;2;3;4;5;6;7;8;9;10";
        status=status.split(";");
        for (var i = 0; i < status.length; i++) {
            var str = document.createElement("tr");
            for (var j = 0; j < 5; j++) {
                var cell = document.createElement("td");
                var textocell = document.createTextNode(status[i+j*5]);
                cell.appendChild(textocell);
                str.appendChild(cell);
            }
            table.appendChild(str);
        }}, 100);
    

    setInterval(() => {
        counter.textContent = currentCount++;}, 100);
}());