// Copyright (c) jdneo. All rights reserved.
// Licensed under the MIT license.

import { Command, Uri } from "vscode";
import { IProblem, ProblemState } from "../shared";

export class AcmicpcNode {
    constructor(
        private data: IProblem,
        private isProblemNode: boolean = true
    ) {}

    public get name(): string {
        return this.data.name;
    }

    public get state(): ProblemState {
        return this.data.state;
    }

    public get id(): string {
        return this.data.id;
    }

    public get isProblem(): boolean {
        return this.isProblemNode;
    }

    public get previewCommand(): Command {
        return {
            title: "Preview Problem",
            command: "acmicpc.previewProblem",
            arguments: [this],
        };
    }

    public get uri(): Uri {
        return Uri.from({
            scheme: "acmicpc",
            authority: this.isProblem ? "problems" : "tree-node",
            path: `/${this.id}`, // path must begin with slash /
        });
    }
}
