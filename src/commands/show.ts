// Copyright (c) jdneo. All rights reserved.
// Licensed under the MIT license.

import * as _ from "lodash";
import * as vscode from "vscode";
import { explorerNodeManager } from "../explorer/explorerNodeManager";
import { AcmicpcNode } from "../explorer/acmicpcNode";
import { acmicpcChannel } from "../acmicpcChannel";
import { IProblem, IQuickItemEx, ProblemState } from "../shared";

import {
    acmicpcPreviewProvider,
    IDescription,
} from "../webview/acmicpcPreviewProvider";
import axios from "axios";
import cheerio from "cheerio";

export async function previewProblem(
    input: IProblem,
    isSideMode: boolean = false
): Promise<void> {
    let node: IProblem = input;
    acmicpcPreviewProvider.show(
        await getProblemData(node.id),
        node,
        isSideMode
    );
}

async function getProblemData(no: string): Promise<IDescription> {
    const url = "https://www.acmicpc.net/problem/" + no;
    try {
        const html = await axios.get(url);
        const $ = cheerio.load(html.data);

        const $body = $("#problem-body").html();
        const bodyHtml = $body;
        if (bodyHtml != undefined) {
            return {
                title: $("title").text().trim(),
                url: url,
                body: bodyHtml,
            };
        }
    } catch (error: any) {
        vscode.window.showErrorMessage(error);
    }
    return { url: "", title: "", body: "" };
    // const raw = await fetch(url).then((res) => res.text());
    // const $raw = $(raw);
    // $raw.find("img").attr("src", (i, v) =>
    //     v.match(/^\//) ? "https://www.acmicpc.net" + v : v
    // );

    // const descript = $raw
    //     .find("#description, #input, #output")
    //     .toArray()
    //     .map((v) => $(v).html().replace(/\t/g, ""))
    //     .join("\n");
    // const cases = $raw
    //     .find(".sampledata")
    //     .toArray()
    //     .map((v) => $(v).text().replace(/\n$/, ""))
    //     .chunk(2);
    // const title = $raw.find("#problem_title").text();
    // return {
    //     descript,
    //     cases,
    //     title,
    // };
}
