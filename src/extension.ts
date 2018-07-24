'use strict';
import * as vscode from 'vscode';
import * as request from 'request-promise-native';

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('extension.pasteFromScreenshot', async () => {

        // Get the url from input
        let imageUrl = await vscode.window.showInputBox({
            prompt: 'Enter screenshot url',
            validateInput: (text: string): string | undefined => {
                if (!text || text.indexOf('.') === -1) {
                    return 'You must enter a valid url';
                } else {
                    return undefined;
                }
            }
        });

        // Show progress in the bottom bar
        vscode.window.withProgress({ location: vscode.ProgressLocation.Window, title: '' }, p => {
            return new Promise((resolve, reject) => {

                // Set up request for OCR
                p.report({message: 'Processing image...' });
                const subscriptionKey = 'd9177a6ecb3442a0873c4ccacd3f9e5e';
                const uriBase = 'https://westcentralus.api.cognitive.microsoft.com/vision/v2.0/ocr';
                const params = {
                    'language': 'unk',
                    'detectOrientation': 'true',
                };
                const options = {
                    uri: uriBase,
                    qs: params,
                    body: '{"url": ' + '"' + imageUrl + '"}',
                    headers: {
                        'Content-Type': 'application/json',
                        'Ocp-Apim-Subscription-Key': subscriptionKey
                    }
                };

                // Send the request
                request.post(options, (error: any, response: any, body: any) => {
                    if (error || response.statusCode !== 200) {
                        reject(error);
                        return;
                    }

                    // Parse the text returned
                    p.report({message: 'Parsing text...' });
                    let regions = JSON.parse(body).regions;
                    
                    let lines: any = [];
                    regions.forEach((region: any) => {
                        lines = lines.concat(region.lines);
                    });
                    let previewText = "";
                    lines.forEach((line: any) => {
                        line.words.forEach((word: any) => {
                            previewText += `${word.text} `;
                        });
                        previewText += '\n';
                    });

                    // Open a new document and display the text
                    var setting: vscode.Uri = vscode.Uri.parse('untitled:' + 'PasteFromScreenshot.txt');
                    vscode.workspace.openTextDocument(setting).then((doc: vscode.TextDocument) => {
                        vscode.window.showTextDocument(doc, 1, false).then(e => {
                            e.edit(edit => {
                                edit.replace(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(doc.lineCount + 1, 0)), previewText);
                            });
                        });
                    }, (error: any) => {
                        reject(error);
                    });
                }).catch((error: any) => {
                    console.log(error);
                });
            });
        });
    });
    context.subscriptions.push(disposable);
}

export function deactivate() {
}