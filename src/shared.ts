/* eslint-disable @typescript-eslint/naming-convention */
// Copyright (c) jdneo. All rights reserved.
// Licensed under the MIT license.

import * as vscode from "vscode";

export interface IQuickItemEx<T> extends vscode.QuickPickItem {
  value: T;
}

export enum ProblemState {
  AC = 1,
  NotAC = 2,
  Unknown = 3,
}

export interface IProblem {
  state: ProblemState;
  id: string;
  name: string;
}

export const defaultProblem: IProblem = {
  state: ProblemState.Unknown,
  id: "",
  name: "",
};

export enum Category {
  All = "All",
  Class = "Class",
  Step = "Step",
  Workbook = "Workbook",
}
