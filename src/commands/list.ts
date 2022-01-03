// Copyright (c) jdneo. All rights reserved.
// Licensed under the MIT license.
import * as vscode from "vscode";
import { AcmicpcNode } from "../explorer/acmicpcNode";
import { ProblemState } from "../shared";
import axios from "axios";
import cheerio from "cheerio";

class SolvedManager implements vscode.Disposable {
    private solvedProblem: Set<string> = new Set<string>();
    private solvedWorkbook: Set<string> = new Set<string>();

    public async setSolved() {
        const solved = getSolveProblem();
        this.solvedProblem = await solved;
    }
    dispose() {
        this.solvedProblem.clear();
    }
    public isSolved(title: string): ProblemState {
        if (this.solvedProblem.has(title) || this.solvedWorkbook.has(title)) {
            return ProblemState.AC;
        } else {
            return ProblemState.NotAC;
        }
    }
    public setSolvedWorkbook(title: string) {
        this.solvedWorkbook.add(title);
    }
}
export async function getClassNodeMap(): Promise<
    Map<string, Map<string, AcmicpcNode>>
> {
    const ret: Map<string, Map<string, AcmicpcNode>> = new Map<
        string,
        Map<string, AcmicpcNode>
    >();
    const tmp: Promise<Map<string, AcmicpcNode>>[] = [];
    let lo = vscode.workspace
        .getConfiguration()
        .get<number>("acmicpc.class.range.min");
    let hi = vscode.workspace
        .getConfiguration()
        .get<number>("acmicpc.class.range.max");
    hi = hi ? hi : 10;
    lo = lo ? lo : 1;
    hi = Math.max(Math.min(10, hi), 1);
    lo = Math.min(Math.max(1, lo), 10);
    for (var i = lo; i <= hi; i++) {
        tmp.push(getClassList(i));
    }
    for (var j = lo; j <= hi; j++) {
        ret.set("Class " + j, await tmp[j]);
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
    const stepList = getStepList();
    const tmp: Promise<[string, Map<string, AcmicpcNode>]>[] = [];
    for (const step of await stepList) {
        tmp.push(getWorkbook("https://www.acmicpc.net/" + step));
    }
    for (const item of tmp) {
        const [hd, mp] = await item;
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
    let state: ProblemState = ProblemState.AC;
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
                const pstate = solvedManager.isSolved(pname);
                problems.set(
                    pname,
                    new AcmicpcNode({
                        state: pstate,
                        id: pid[2],
                        name: pname,
                    })
                );
                if (pstate != ProblemState.AC) {
                    state = ProblemState.Unknown;
                }
            }
        });
    } catch (error: any) {
        vscode.window.showErrorMessage(error);
    }
    if (state == ProblemState.AC) {
        solvedManager.setSolvedWorkbook(header);
    }
    return [header, problems];
}

async function getClassList(
    classNum: number
): Promise<Map<string, AcmicpcNode>> {
    let state: ProblemState = ProblemState.AC;
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
            const pstate = solvedManager.isSolved(item.titleKo);
            problems.set(
                item.titleKo,
                new AcmicpcNode({
                    state: pstate,
                    id: item.problemId,
                    name: item.titleKo,
                })
            );
            if (pstate != ProblemState.AC) {
                state = ProblemState.Unknown;
            }
        }
    } catch (error: any) {
        vscode.window.showErrorMessage(error);
    }
    if (state == ProblemState.AC) {
        solvedManager.setSolvedWorkbook("Class " + classNum);
    }
    return problems;
}

async function getSolveProblem() {
    const problems: Set<string> = new Set<string>();
    try {
        let count: number = 0;
        let pageidx: number = 1;
        do {
            const response = await axios.get(
                "https://solved.ac/api/v3/search/problem",
                {
                    params: {
                        query:
                            "solved_by:" +
                            vscode.workspace
                                .getConfiguration()
                                .get<string>("acmicpc.user"),
                        page: pageidx.toString(),
                    },
                    headers: { "Content-Type": "application/json" },
                }
            );
            if (count === 0) {
                count = response.data.count;
            }
            count -= response.data.items.length;
            pageidx++;
            for (const item of response.data.items) {
                problems.add(item.titleKo);
            }
        } while (count !== 0);
    } catch (error: any) {
        vscode.window.showErrorMessage(error);
    }
    return problems;
}

export const solvedManager: SolvedManager = new SolvedManager();
