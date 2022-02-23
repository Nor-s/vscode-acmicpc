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
    isSideMode: boolean = true
): Promise<void> {
    let node: IProblem = input;
    acmicpcPreviewProvider.show(
        await getProblemData(node.id),
        node,
        isSideMode
    );
}
let count = 0;

async function getProblemData(no: string): Promise<IDescription> {
    const url = "https://www.acmicpc.net/problem/" + no;
    acmicpcChannel.appendLine("url:" + url);
    try {
        count++;
        acmicpcChannel.appendLine("count:" + count.toString());
        const html = await axios.get(url, {
            headers: { "User-Agent": "Mozilla/5.0" },
        });
        acmicpcChannel.appendLine("get url");
        const $ = cheerio.load(html.data);
        acmicpcChannel.appendLine("load html data");
        $("img").each(function () {
            var old_src = $(this).attr("src");
            if (old_src != undefined && !/^(http|https):\/\//.test(old_src)) {
                let new_src = "https://www.acmicpc.net" + old_src;
                $(this).attr("src", new_src);
            }
        });
        const $body = $("#problem-body").html();
        const bodyHtml = $body;
        if (bodyHtml != undefined) {
            acmicpcChannel.appendLine($("title").text().trim());
            return {
                title: $("title").text().trim(),
                url: url,
                body: bodyHtml,
            };
        }
    } catch (error: any) {
        acmicpcChannel.appendLine(error);
    }
    acmicpcChannel.appendLine("NULL problem");
    return { url: "", title: "", body: "" };
}
