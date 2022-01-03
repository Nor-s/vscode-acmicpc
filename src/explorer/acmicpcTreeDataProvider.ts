// Copyright (c) jdneo. All rights reserved.
// Licensed under the MIT license.

import * as vscode from "vscode";
import * as path from "path";
import { Category, ProblemState } from "../shared";
import { explorerNodeManager } from "./explorerNodeManager";
import { AcmicpcNode } from "./acmicpcNode";

export class AcmicpcTreeDataProvider
  implements vscode.TreeDataProvider<AcmicpcNode>
{
  private context!: vscode.ExtensionContext;

  private onDidChangeTreeDataEvent: vscode.EventEmitter<
    AcmicpcNode | undefined | null
  > = new vscode.EventEmitter<AcmicpcNode | undefined | null>();
  // tslint:disable-next-line:member-ordering
  public readonly onDidChangeTreeData: vscode.Event<any> =
    this.onDidChangeTreeDataEvent.event;

  public initialize(context: vscode.ExtensionContext): void {
    this.context = context;
  }

  public async refresh(): Promise<void> {
    await explorerNodeManager.refreshCache();
    this.onDidChangeTreeDataEvent.fire(null);
  }

  public getTreeItem(
    element: AcmicpcNode
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    let contextValue: string;
    if (element.isProblem) {
      contextValue = "problem";
    } else {
      contextValue = element.id.toLowerCase();
    }

    return {
      label: element.isProblem
        ? `[${element.id}] ${element.name}`
        : element.name,
      collapsibleState: element.isProblem
        ? vscode.TreeItemCollapsibleState.None
        : vscode.TreeItemCollapsibleState.Collapsed,
      iconPath: this.parseIconPathFromProblemState(element),
      command: element.isProblem ? element.previewCommand : undefined,
      resourceUri: element.uri,
      contextValue,
    };
  }

  public getChildren(
    element?: AcmicpcNode | undefined
  ): vscode.ProviderResult<AcmicpcNode[]> {
    if (!element) {
      // Root view
      return explorerNodeManager.getRootNodes();
    } else {
      switch (
        element.id // First-level
      ) {
        case Category.Step:
          return explorerNodeManager.getAllStepNodes();
        case Category.Class:
          return explorerNodeManager.getAllClassNodes();
        case Category.Workbook:
          return explorerNodeManager.getAllWorkbookNodes();
        default:
          if (element.isProblem) {
            return [];
          }
          return explorerNodeManager.getChildrenNodesById(element.id);
      }
    }
  }
  private parseIconPathFromProblemState(element: AcmicpcNode): string {
    if (!element.isProblem) {
      return "";
    }
    switch (element.state) {
      case ProblemState.AC:
        return this.context.asAbsolutePath(path.join("resources", "check.png"));
      case ProblemState.Unknown:
        return this.context.asAbsolutePath(path.join("resources", "blank.png"));
      default:
        return this.context.asAbsolutePath(path.join("resources", "blank.png"));
    }
  }
}

export const acmicpcTreeDataProvider: AcmicpcTreeDataProvider =
  new AcmicpcTreeDataProvider();
