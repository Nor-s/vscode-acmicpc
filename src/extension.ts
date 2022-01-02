import * as vscode from "vscode";
import { explorerNodeManager } from "./explorer/explorerNodeManager";
import { AcmicpcNode } from "./explorer/acmicpcNode";
import { acmicpcTreeDataProvider } from "./explorer/acmicpcTreeDataProvider";

export function activate(context: vscode.ExtensionContext) {
    // classList(1);
    //getStepList();
    //getWorkbook("https://www.acmicpc.net/workbook/view/1939");
    acmicpcTreeDataProvider.refresh();

    acmicpcTreeDataProvider.initialize(context);

    context.subscriptions.push(
        explorerNodeManager,
        vscode.window.createTreeView("acmicpc-sidebar", {
            treeDataProvider: acmicpcTreeDataProvider,
            showCollapseAll: true,
        })
    );
}
export function deactivate() {}
