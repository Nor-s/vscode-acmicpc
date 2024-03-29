// Copyright (c) jdneo. All rights reserved.
// Licensed under the MIT license.

import { workspace, WorkspaceConfiguration } from "vscode";
// TODO: What??
export function getWorkspaceConfiguration(): WorkspaceConfiguration {
    return workspace.getConfiguration("acmicpc");
}

export function shouldHideSolvedProblem(): boolean {
    return getWorkspaceConfiguration().get<boolean>("hideSolved", false);
}

export function getWorkspaceFolder(): string {
    return getWorkspaceConfiguration().get<string>("workspaceFolder", "");
}

export function getEditorShortcuts(): string[] {
    return getWorkspaceConfiguration().get<string[]>("editor.shortcuts", [
        "submit",
        "test",
    ]);
}
