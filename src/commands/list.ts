// Copyright (c) jdneo. All rights reserved.
// Licensed under the MIT license.
import * as vscode from "vscode";
import { AcmicpcNode } from "../explorer/acmicpcNode";
import * as cp from "child_process";
import * as fse from "fs-extra";
import * as os from "os";
import * as path from "path";
import * as requireFromString from "require-from-string";
import {
    ExtensionContext,
    ConfigurationChangeEvent,
    Disposable,
    MessageItem,
    window,
    workspace,
    WorkspaceConfiguration,
} from "vscode";
import { IProblem, ProblemState } from "../shared";
import axios from "axios";
import cheerio from "cheerio";
import { stringify } from "querystring";
//var axios = require("axios").default;

export async function getClassNodeMap(): Promise<
    Map<string, Map<string, AcmicpcNode>>
> {
    const ret: Map<string, Map<string, AcmicpcNode>> = new Map<
        string,
        Map<string, AcmicpcNode>
    >();
    for (var i = 1; i <= 10; i++) {
        ret.set("Class " + i, await getClassList(i));
    }
    return ret;
}
export async function getStepNodeMap(): Promise<
    Map<string, Map<string, AcmicpcNode>>
> {
    const ret: Map<string, Map<string, AcmicpcNode>> = new Map<
        string,
        Map<string, AcmicpcNode>
    >();
    let stepList = getStepList();
    for (const step of await stepList) {
        let [hd, mp] = await getWorkbook("https://www.acmicpc.net/" + step);
        ret.set(hd, mp);
    }
    return ret;
}
export async function getWorkbookNodeMap(): Promise<
    Map<string, Map<string, AcmicpcNode>>
> {
    const ret: Map<string, Map<string, AcmicpcNode>> = new Map<
        string,
        Map<string, AcmicpcNode>
    >();
    let workbookList = vscode.workspace
        .getConfiguration()
        .get<Array<string>>("acmicpc.workbookList");
    if (workbookList != undefined) {
        for (const workbook of workbookList) {
            let [hd, mp] = await getWorkbook(workbook);
            ret.set(hd, mp);
        }
    }
    return ret;
}
async function getStepList() {
    const url = "https://www.acmicpc.net/step";
    let stepList: string[] = [];
    try {
        const html = await axios.get(url);
        const $ = cheerio.load(html.data);
        const $bodyList = $("div.table-responsive table")
            .children("tbody")
            .children("tr");
        $bodyList.each(function (i, elem) {
            const link = $(this).find("a").attr("href");
            if (link != undefined) {
                stepList.push(link);
            }
        });
    } catch (error: any) {
        vscode.window.showErrorMessage(error);
    }
    return stepList;
}

async function getWorkbook(
    url: string
): Promise<[string, Map<string, AcmicpcNode>]> {
    const problems: Map<string, AcmicpcNode> = new Map<string, AcmicpcNode>();
    let header: string = "";
    try {
        const html = await axios.get(url);
        const $ = cheerio.load(html.data);
        header = $("title").first().text().trim();
        const $bodyList = $("div.table-responsive table")
            .children("tbody")
            .children("tr");
        $bodyList.each(function (i, elem) {
            let pid = $(this).find("a").attr("href")?.split("/");
            if (pid != undefined && /problem/.test(pid[1])) {
                const pname = $(this).find("a").first().text().trim();
                problems.set(
                    pname,
                    new AcmicpcNode({
                        state: ProblemState.Unknown,
                        id: pid[2],
                        name: pname,
                    })
                );
            }
        });
    } catch (error: any) {
        vscode.window.showErrorMessage(error);
    }
    return [header, problems];
}

async function getClassList(classNum: number) {
    const problems: Map<string, AcmicpcNode> = new Map<string, AcmicpcNode>();
    try {
        const response = await axios.get(
            "https://solved.ac/api/v3/search/problem",
            {
                params: { query: "in_class:" + classNum },
                headers: { "Content-Type": "application/json" },
            }
        );
        for (const item of response.data.items) {
            item.titleKo;
            problems.set(
                item.titleKo,
                new AcmicpcNode({
                    state: ProblemState.Unknown,
                    id: item.problemId,
                    name: item.titleKo,
                })
            );
        }
    } catch (error: any) {
        vscode.window.showErrorMessage(error);
    }
    return problems;
}
function parseProblemState(stateOutput: string): ProblemState {
    if (!stateOutput) {
        return ProblemState.Unknown;
    }
    switch (stateOutput.trim()) {
        case "v":
        case "✔":
        case "√":
            return ProblemState.AC;
        case "X":
        case "✘":
        case "×":
            return ProblemState.NotAC;
        default:
            return ProblemState.Unknown;
    }
}
