// Copyright (c) jdneo. All rights reserved.
// Licensed under the MIT license.

import { commands, ViewColumn } from "vscode";
import { IProblem } from "../shared";
import { ILeetCodeWebviewOption, AcmicpcWebview } from "./acmicpcWebview";
import { markdownEngine } from "./markdownEngine";

class AcmicpcPreviewProvider extends AcmicpcWebview {
  protected readonly viewType: string = "acmicpc.preview";
  // TODO: "!" mean?
  private node!: IProblem;
  private description!: IDescription;
  private sideMode: boolean = false;

  public isSideMode(): boolean {
    return this.sideMode;
  }

  public show(
    desc: IDescription,
    node: IProblem,
    isSideMode: boolean = false
  ): void {
    this.description = desc;
    this.node = node;
    this.sideMode = isSideMode;
    this.showWebviewInternal();
    // Comment out this operation since it sometimes may cause the webview become empty.
    // Waiting for the progress of the VS Code side issue: https://github.com/microsoft/vscode/issues/3742
    // if (this.sideMode) {
    //     this.hideSideBar(); // For better view area
    // }
  }

  protected getWebviewOption(): ILeetCodeWebviewOption {
    if (!this.sideMode) {
      return {
        title: `${this.node.name}: Preview`,
        viewColumn: ViewColumn.One,
      };
    } else {
      return {
        title: "Description",
        viewColumn: ViewColumn.Two,
        preserveFocus: true,
      };
    }
  }

  protected getWebviewContent(): string {
    const { title, url, body } = this.description;
    const head: string = markdownEngine.render(`# [${title}](${url})`);
    const links: string = markdownEngine.render(
      `[Submit](${this.getSubmitLink()})`
    );
    return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https:; script-src vscode-resource: 'unsafe-inline'; style-src vscode-resource: 'unsafe-inline';"/>
                ${markdownEngine.getStyles()}
                <style>
                    code { white-space: pre-wrap; }
                </style>
            </head>
            <body>
                ${head}
                ${body}
                <hr />
                ${links}
            </body>
            </html>
        `;
  }

  protected onDidDisposeWebview(): void {
    super.onDidDisposeWebview();
    this.sideMode = false;
  }

  // TODO: pacakge 에 showproblem
  protected async onDidReceiveMessage(message: IWebViewMessage): Promise<void> {
    switch (message.command) {
      case "ShowProblem": {
        await commands.executeCommand("acmicpc.showProblem", this.node);
        break;
      }
    }
  }

  // private async hideSideBar(): Promise<void> {
  //     await commands.executeCommand("workbench.action.focusSideBar");
  //     await commands.executeCommand("workbench.action.toggleSidebarVisibility");
  // }
  private getSubmitLink(): string {
    return "https://www.acmicpc.net/submit/" + this.node.id;
  }
}

export interface IDescription {
  title: string;
  url: string;
  body: string;
}

interface IWebViewMessage {
  command: string;
}

export const acmicpcPreviewProvider: AcmicpcPreviewProvider =
  new AcmicpcPreviewProvider();
