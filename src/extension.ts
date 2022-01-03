import * as vscode from "vscode";
import * as show from "./commands/show";
import { explorerNodeManager } from "./explorer/explorerNodeManager";
import { AcmicpcNode } from "./explorer/acmicpcNode";
import { acmicpcTreeDataProvider } from "./explorer/acmicpcTreeDataProvider";
import { acmicpcChannel } from "./acmicpcChannel";
import { DialogType, promptForOpenOutputChannel } from "./utils/uiUtils";
import { solvedManager } from "./commands/list";
import { acmicpcTreeItemDecorationProvider } from "./explorer/acmicpcTreeItemDecorationProvider";

export function activate(context: vscode.ExtensionContext) {
  // classList(1);
  //getStepList();
  //getWorkbook("https://www.acmicpc.net/workbook/view/1939");
  acmicpcTreeDataProvider.refresh();

  acmicpcTreeDataProvider.initialize(context);
  try {
    context.subscriptions.push(
      acmicpcChannel,
      solvedManager,
      explorerNodeManager,
      vscode.window.registerFileDecorationProvider(
        acmicpcTreeItemDecorationProvider
      ),
      vscode.window.createTreeView("acmicpc-sidebar", {
        treeDataProvider: acmicpcTreeDataProvider,
        showCollapseAll: true,
      }),
      vscode.commands.registerCommand(
        "acmicpc.previewProblem",
        (node: AcmicpcNode) => show.previewProblem(node)
      )
    );
  } catch (error: any) {
    acmicpcChannel.appendLine(error.toString());
    promptForOpenOutputChannel(
      "Extension initialization failed. Please open output channel for details.",
      DialogType.error
    );
  }
}
export function deactivate() {}
