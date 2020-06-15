import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from "fs";

// destination.txt will be created or overwritten by default.

const cats = {
	'Coding Cat': 'https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif',
	'Compiling Cat': 'https://media.giphy.com/media/mlvseq9yvZhba/giphy.gif',
	'Testing Cat': 'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif'
};

/**
 * Funcion para asignar la funcion a cada comando del command pallete
 * @param context 
 */

export function activate(context: vscode.ExtensionContext) {


	/**
	 * Se asigna el comando vscodememory a su respectiva funcion
	 */
	context.subscriptions.push(
		vscode.commands.registerCommand('vscodememory.start', () => {
			CodingPanel.createOrShow(context.extensionPath);
		})
	);


	/**
	 * Se Registra el webview
	 */
	if (vscode.window.registerWebviewPanelSerializer) {
		// Make sure we register a serializer in activation event
		vscode.window.registerWebviewPanelSerializer(CodingPanel.viewType, {
			async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
				console.log(`Got state: ${state}`);
				CodingPanel.revive(webviewPanel, context.extensionPath);
			}
		});
	}
}

/**
 * Se maneja el panel principal
 */
class CodingPanel {
	/**
	 * Funciones para inicializar el panel
	 */
	public static currentPanel: CodingPanel | undefined;
	public static readonly viewType = 'vsCoding';


	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionPath: string;
	private _disposables: vscode.Disposable[] = [];


	/**
	 * Metodo para crear, o actualizar, el webview
	 * @param extensionPath 
	 */
	public static createOrShow(extensionPath: string) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

			var s=vscode.workspace.rootPath;
				if(s!=undefined){

					//Se copia la biblioteca dinamica en el proyecto

					fs.copyFile("/home/brayan/Documents/Projects/VSCodeMemory/Library/libvscode.so", path.join(s, "libvscode.so"), (err) => {
						if (err) throw err;
						console.log("was copied to destination");
					});
				

					//Se copian las configuraciones para incluir la biblioteca

					var fileName = path.join(s, ".vscode/c_cpp_properties.json");
					var file = require(fileName);
					
					file.configurations[0].includePath[file.configurations[0].includePath.length]="/home/brayan/Documents/Projects/VSCodeMemory/Library/**";

					fs.writeFile(fileName,JSON.stringify(file, null, 2), function writeJSON(err) {
					  if (err) return console.log(err);
					  console.log(JSON.stringify(file));
					  console.log('writing to ' + fileName);
					});


					fileName = path.join(s, ".vscode/tasks.json");
					file = require(fileName);
					file.tasks[0].args = [
						"${file}",
						"-I/home/brayan/Documents/Projects/VSCodeMemory/Library",
						"-L/home/brayan/Documents/Projects/VSCodeMemory/Library",
						"-lvscode",
						"-lstdc++",
						"-pthread",
						"-o",
						"${fileDirname}/a.out"
					]
					fs.writeFile(fileName, JSON.stringify(file, null, 2), function writeJSON(err) {
						if (err)
							return console.log(err);
						console.log(JSON.stringify(file));
						console.log('writing to ' + fileName);
					});


					
				}
				

		// Si ya hay un panel, se muestra
		if (CodingPanel.currentPanel) {
			CodingPanel.currentPanel._panel.reveal(column);
			return;
		}

		// Sino, se muestra 
		const panel = vscode.window.createWebviewPanel(
			CodingPanel.viewType,
			'Cat Coding',
			column || vscode.ViewColumn.One,
			{
				// Se autoriza javascript en el webvies
				enableScripts: true,
				localResourceRoots: [vscode.Uri.file(path.join(extensionPath, 'media'))]
			}
		);

		CodingPanel.currentPanel = new CodingPanel(panel, extensionPath);
	}

	/**
	 * Se actualiza el panel
	 * @param panel 
	 * @param extensionPath 
	 */
	public static revive(panel: vscode.WebviewPanel, extensionPath: string) {
		CodingPanel.currentPanel = new CodingPanel(panel, extensionPath);
	}


	/**
	 * Metodo Constructor
	 * @param panel Nuevo panel
	 * @param extensionPath  Ruta de la extension
	 */
	private constructor(panel: vscode.WebviewPanel, extensionPath: string) {
		
		this._panel = panel;
		this._extensionPath = extensionPath;

		//Se establece el contenido web
		this._update();

		this.doStuff();
		
		//Se esta atento a si se cierra el programa para eliminarlo
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
		

		//Se manejan los mensajes entre el webview y la extension
		this._panel.webview.onDidReceiveMessage(
			message => {
				var data;
				console.log(message.text);
				switch (message.command) {
					case 'settings':
						data = message.text;
						fs.writeFile("/home/brayan/Documents/Projects/VSCodeMemory/Library/clientsettings.txt", message.text, (err) => {
							if (err) console.log(err);
							console.log("Successfully Written to File.");
						}); 						
						return;
					case 'alert':
						vscode.window.showErrorMessage(message.text);
						return;
					case 'local':
						data = "local";
						fs.writeFile("/home/brayan/Documents/Projects/VSCodeMemory/Library/local.txt", data, (err) => {
							if (err) console.log(err);
							console.log("Successfully Written to File.");
						}); 
						return;
					case 'remote':
						data = "remote";
						fs.writeFile("/home/brayan/Documents/Projects/VSCodeMemory/Library/local.txt", data, (err) => {
							if (err) console.log(err);
							console.log("Successfully Written to File.");
						}); 
						return;
				}
			},
			null,
			this._disposables
		);

	}


	/**
	 * Funcion para actualizar el contenido de la tabla
	 */
	public doStuff(){
		var datatable="";
		
		setInterval(() => {

			datatable=fs.readFileSync("/home/brayan/Documents/Projects/VSCodeMemory/Library/data.txt",{ encoding: 'utf8' });

	 		this._panel.webview.postMessage({ command: 'data', text:datatable });
       }, 100);
	}

	/**
	 * Funcion para desechar el panel
	 */
	public dispose() {
		CodingPanel.currentPanel = undefined;

		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	/**
	 * Funcion para actualizar webview
	 */
	private _update() {
		const webview = this._panel.webview;

		this._updateForCat(webview);
	}


	/**
	 * Funcion para inicializar panel html de webview
	 * @param webview Panel de webview
	 */
	private _updateForCat(webview: vscode.Webview) {
		this._panel.title = "Heap Visualizer";
		this._panel.webview.html = this._getHtmlForWebview(webview);
	}

	/**
	 * Se crea el panel del webview
	 * @param webview Panel del webview
	 */
	private _getHtmlForWebview(webview: vscode.Webview) {
		// Local path to main script run in the webview
		const scriptPathOnDisk = vscode.Uri.file(
			path.join(this._extensionPath, 'media', 'main.js')
		);


		const scriptUri = webview.asWebviewUri(scriptPathOnDisk);

		// Funcion para extablecer cuales scripts se pueden correr
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
                <h1 id="lines-of-code-counter"></h1>
				<h2>Heap Visualizer </h2>

					
				<h3>Visualizer</h3>


				<input type="radio" id="local" name="settings" value="local">
				<label for="male">Local</label><br>
				<input type="radio" id="remote" name="settings" value="remote">
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

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
