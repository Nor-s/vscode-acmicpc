// Copyright (c) jdneo. All rights reserved.
// Licensed under the MIT license.

import * as vscode from "vscode";

class AcmicpcChannel implements vscode.Disposable {
    private readonly channel: vscode.OutputChannel =
        vscode.window.createOutputChannel("acmicpc");

    public appendLine(message: string): void {
        this.channel.appendLine(message);
    }

    public append(message: string): void {
        this.channel.append(message);
    }

    public show(): void {
        this.channel.show();
    }

    public dispose(): void {
        this.channel.dispose();
    }
}

export const acmicpcChannel: AcmicpcChannel = new AcmicpcChannel();
