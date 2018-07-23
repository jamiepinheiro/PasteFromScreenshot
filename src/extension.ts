'use strict';
import * as vscode from 'vscode';
import * as request from "request-promise-native";

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand('extension.pasteFromScreenshot', async () => {
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

        // Replace <Subscription Key> with your valid subscription key.
        const subscriptionKey = 'd9177a6ecb3442a0873c4ccacd3f9e5e';

        // You must use the same location in your REST call as you used to get your
        // subscription keys. For example, if you got your subscription keys from
        // westus, replace "westcentralus" in the URL below with "westus".
        const uriBase = 'https://westcentralus.api.cognitive.microsoft.com/vision/v2.0/ocr';

        // Request parameters.
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

        request.post(options, (error, response, body) => {
            if (error) {
                console.log('Error: ', error);
                return;
            }

            let lines = JSON.parse(body).regions[0].lines;
            console.log(lines);

            let previewText = "";
            
            lines.forEach((line: any) => {
                line.words.forEach((word: any) => {
                    previewText += word.text + ' ';
                });
                previewText += '\n';
            });

            vscode.window.showInformationMessage(previewText);
            
        });

    });
    context.subscriptions.push(disposable);
}

export function deactivate() {
}