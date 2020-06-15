"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const path = require("path");
const vscode = require("vscode");
const fs = require("fs");
// destination.txt will be created or overwritten by default.
const cats = {
    'Coding Cat': 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
    'Compiling Cat': 'https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif',
    'Testing Cat': 'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif'
};
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('catCoding.start', () => {
        CatCodingPanel.createOrShow(context.extensionPath);
    }));
    if (vscode.window.registerWebviewPanelSerializer) {
        // Make sure we register a serializer in activation event
        vscode.window.registerWebviewPanelSerializer(CatCodingPanel.viewType, {
            async deserializeWebviewPanel(webviewPanel, state) {
                console.log(`Got state: ${state}`);
                CatCodingPanel.revive(webviewPanel, context.extensionPath);
            }
        });
    }
}
exports.activate = activate;
/**
 * Manages cat coding webview panels
 */
class CatCodingPanel {
    constructor(panel, extensionPath) {
        this._disposables = [];
        this._panel = panel;
        this._extensionPath = extensionPath;
        // Set the webview's initial html content
        this._update();
        this.doStuff();
        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        // Update the content based on view changes
        this._panel.onDidChangeViewState(e => {
            if (this._panel.visible) {
                this._update();
            }
        }, null, this._disposables);
        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(message => {
            var data;
            console.log(message.text);
            switch (message.command) {
                case 'settings':
                    data = message.text;
                    fs.writeFile("/home/brayan/Documents/Projects/VSCodeMemory/Library/clientsettings.txt", message.text, (err) => {
                        if (err)
                            console.log(err);
                        console.log("Successfully Written to File.");
                    });
                    return;
                case 'alert':
                    vscode.window.showErrorMessage(message.text);
                    return;
                case 'local':
                    data = "local";
                    fs.writeFile("/home/brayan/Documents/Projects/VSCodeMemory/Library/local.txt", data, (err) => {
                        if (err)
                            console.log(err);
                        console.log("Successfully Written to File.");
                    });
                    return;
                case 'remote':
                    data = "remote";
                    fs.writeFile("/home/brayan/Documents/Projects/VSCodeMemory/Library/local.txt", data, (err) => {
                        if (err)
                            console.log(err);
                        console.log("Successfully Written to File.");
                    });
                    return;
            }
        }, null, this._disposables);
    }
    static createOrShow(extensionPath) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        var s = vscode.workspace.rootPath;
        if (s != undefined) {
            fs.copyFile("/home/brayan/Documents/Projects/VSCodeMemory/Library/libvscode.so", path.join(s, "libvscode.so"), (err) => {
                if (err)
                    throw err;
                console.log("was copied to destination");
            });
            var fileName = path.join(s, ".vscode/c_cpp_properties.json");
            var file = require(fileName);
            file.configurations[0].includePath[file.configurations[0].includePath.length] = "/home/brayan/Documents/Projects/VSCodeMemory/Library/**";
            fs.writeFile(fileName, JSON.stringify(file, null, 2), function writeJSON(err) {
                if (err)
                    return console.log(err);
                console.log(JSON.stringify(file));
                console.log('writing to ' + fileName);
            });
            fileName = path.join(s, ".vscode/tasks.json");
            file = require(fileName);
            file.tasks[0].args = [
                "${file}",
                "-I/home/brayan/Documents/Projects/VSCodeMemory",
                "-L/home/brayan/Documents/Projects/VSCodeMemory/Library",
                "-lvscode",
                "-lstdc++",
                "-o",
                "${fileDirname}/a.out"
            ];
            fs.writeFile(fileName, JSON.stringify(file, null, 2), function writeJSON(err) {
                if (err)
                    return console.log(err);
                console.log(JSON.stringify(file));
                console.log('writing to ' + fileName);
            });
        }
        // If we already have a panel, show it.
        if (CatCodingPanel.currentPanel) {
            CatCodingPanel.currentPanel._panel.reveal(column);
            return;
        }
        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(CatCodingPanel.viewType, 'Cat Coding', column || vscode.ViewColumn.One, {
            // Enable javascript in the webview
            enableScripts: true,
            // And restrict the webview to only loading content from our extension's `media` directory.
            localResourceRoots: [vscode.Uri.file(path.join(extensionPath, 'media'))]
        });
        CatCodingPanel.currentPanel = new CatCodingPanel(panel, extensionPath);
    }
    static revive(panel, extensionPath) {
        CatCodingPanel.currentPanel = new CatCodingPanel(panel, extensionPath);
    }
    doRefactor() {
        // Send a message to the webview webview.
        // You can send any JSON serializable data.
        this._panel.webview.postMessage({ command: 'refactor' });
    }
    doStuff() {
        var datatable = "";
        setInterval(() => {
            datatable = fs.readFileSync("/home/brayan/Documents/Projects/VSCodeMemory/Library/data.txt", { encoding: 'utf8' });
            this._panel.webview.postMessage({ command: 'data', text: datatable });
        }, 100);
    }
    dispose() {
        CatCodingPanel.currentPanel = undefined;
        // Clean up our resources
        this._panel.dispose();
        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
    _update() {
        const webview = this._panel.webview;
        // Vary the webview's content based on where it is located in the editor.
        switch (this._panel.viewColumn) {
            case vscode.ViewColumn.Two:
                this._updateForCat(webview, 'Compiling Cat');
                return;
            case vscode.ViewColumn.Three:
                this._updateForCat(webview, 'Testing Cat');
                return;
            case vscode.ViewColumn.One:
            default:
                this._updateForCat(webview, 'Coding Cat');
                return;
        }
    }
    _updateForCat(webview, catName) {
        this._panel.title = catName;
        this._panel.webview.html = this._getHtmlForWebview(webview, cats[catName]);
    }
    _getHtmlForWebview(webview, catGifPath) {
        // Local path to main script run in the webview
        const scriptPathOnDisk = vscode.Uri.file(path.join(this._extensionPath, 'media', 'main.js'));
        // And the uri we use to load this script in the webview
        const scriptUri = webview.asWebviewUri(scriptPathOnDisk);
        // Use a nonce to whitelist which scripts can be run
        const nonce = getNonce();
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">

                <!--
                Use a content security policy to only allow loading images from https or from our extension directory,
                and only allow scripts that have a specific nonce.
                -->
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} https:; script-src 'nonce-${nonce}';">

                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Cat Coding</title>
            </head>
            <body>
                <h1 id="lines-of-code-counter">0</h1>
				<h2>Heap Visualizer </h2>

					
				<h3>Visualizer</h3>


				<input type="radio" id="local" name="settings" value="local" checked="checked">
				<label for="male">Local</label><br>
				<input type="radio" id="remote" name="settings" value="remote" disabled="true">
				<label for="female">Remote</label><br>
				
				<h3></h3>

				<table style="width:100%" id="table" border="1">
					<tr>
						<th>Id</th>
						<th>Address</th>
						<th>Type</th>
						<th>Value</th>
						<th>References</th>
					</tr>
					<tr>
						<th></th>
						<th></th>
						<th></th>
						<th></th>
						<th></th>
					</tr>
				</table> 
			
				<h3>Client Settings</h3>
				<form action="/action_page.php">
					<label for="iptext">IP:</label>
					<input type="text" id="ip" name="fname"><br><br>
					<label for="porttext">PORT:</label>
					<input type="text" id="port" name="port"><br><br>
					<label for="usertest">User:</label>
					<input type="text" id="user" name="user"><br><br>
					<label for="passtest">Pass:</label>
					<input type="text" id="password" name="passwors"><br><br>
					<input type="submit" id="setsettings" value="Set Settings">
				</form> 

                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
			</html>`;
    }
}
CatCodingPanel.viewType = 'catCoding';
function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
//# sourceMappingURL=extension.js.map