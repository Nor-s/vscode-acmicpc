// Copyright (c) jdneo. All rights reserved.
// Licensed under the MIT license.

import * as _ from "lodash";
import { Disposable, workspace } from "vscode";
import { AcmicpcNode } from "./acmicpcNode";
import { Category, defaultProblem } from "../shared";
import {
    getStepNodeMap,
    getClassNodeMap,
    getWorkbookNodeMap,
    solvedManager,
} from "../commands/list";

class ExplorerNodeManager implements Disposable {
    private classNodeMaps: Map<string, Map<string, AcmicpcNode>> = new Map<
        string,
        Map<string, AcmicpcNode>
    >();
    private stepNodeMaps: Map<string, Map<string, AcmicpcNode>> = new Map<
        string,
        Map<string, AcmicpcNode>
    >();
    private workbookNodeMaps: Map<string, Map<string, AcmicpcNode>> = new Map<
        string,
        Map<string, AcmicpcNode>
    >();
    private isEnableClass = workspace
        .getConfiguration()
        .get<boolean>("acmicpc.class.enabled");
    private isEnableStep = workspace
        .getConfiguration()
        .get<boolean>("acmicpc.step.enabled");

    public async refreshCache(): Promise<void> {
        this.dispose();
        solvedManager.dispose();
        await solvedManager.setSolved();
        let classNodeMaps:
            | Promise<Map<string, Map<string, AcmicpcNode>>>
            | undefined;
        let stepNodeMaps:
            | Promise<Map<string, Map<string, AcmicpcNode>>>
            | undefined;
        if (this.isEnableClass) {
            classNodeMaps = getClassNodeMap();
        }
        if (this.isEnableStep) {
            stepNodeMaps = getStepNodeMap();
        }
        let workbookNodeMaps = getWorkbookNodeMap();

        if (this.isEnableClass && classNodeMaps != undefined) {
            this.classNodeMaps = await classNodeMaps;
        }
        if (this.isEnableStep && stepNodeMaps != undefined) {
            this.stepNodeMaps = await stepNodeMaps;
        }
        this.workbookNodeMaps = await workbookNodeMaps;
    }

    public getRootNodes(): AcmicpcNode[] {
        const ret: AcmicpcNode[] = [];
        if (this.isEnableClass) {
            ret.push(
                new AcmicpcNode(
                    Object.assign({}, defaultProblem, {
                        id: Category.Class,
                        name: Category.Class,
                    }),
                    false
                )
            );
        }
        if (this.isEnableStep) {
            ret.push(
                new AcmicpcNode(
                    Object.assign({}, defaultProblem, {
                        id: Category.Step,
                        name: Category.Step,
                    }),
                    false
                )
            );
        }
        ret.push(
            new AcmicpcNode(
                Object.assign({}, defaultProblem, {
                    id: Category.Workbook,
                    name: Category.Workbook,
                }),
                false
            )
        );
        return ret;
    }

    public getAllClassNodes(): AcmicpcNode[] {
        const res: AcmicpcNode[] = [];
        for (const className of this.classNodeMaps.keys()) {
            let problem = defaultProblem;
            problem.state = solvedManager.isSolved(className);
            res.push(
                new AcmicpcNode(
                    Object.assign({}, problem, {
                        id: `${Category.Class}.${className}`,
                        name: _.startCase(className),
                    }),
                    false
                )
            );
        }
        return res;
    }
    public getAllWorkbookNodes(): AcmicpcNode[] {
        const res: AcmicpcNode[] = [];
        for (const workbook of this.workbookNodeMaps.keys()) {
            let problem = defaultProblem;
            problem.state = solvedManager.isSolved(workbook);
            res.push(
                new AcmicpcNode(
                    Object.assign({}, problem, {
                        id: `${Category.Workbook}.${workbook}`,
                        name: _.startCase(workbook),
                    }),
                    false
                )
            );
        }
        return res;
    }

    public getAllStepNodes(): AcmicpcNode[] {
        const res: AcmicpcNode[] = [];
        for (const step of this.stepNodeMaps.keys()) {
            let problem = defaultProblem;
            problem.state = solvedManager.isSolved(step);
            res.push(
                new AcmicpcNode(
                    Object.assign({}, problem, {
                        id: `${Category.Step}.${step}`,
                        name: _.startCase(step),
                    }),
                    false
                )
            );
        }
        return res;
    }
    //TODO: favorite 추가
    /*   public getFavoriteNodes(): AcmicpcNode[] {
    const res: AcmicpcNode[] = [];
    for (const node of this.explorerNodeMap.values()) {
      if (node.isFavorite) {
        res.push(node);
      }
    }
    return this.applySortingStrategy(res);
  } */

    public dispose(): void {
        for (var classNodes of this.classNodeMaps.values()) {
            classNodes.clear();
        }
        this.classNodeMaps.clear();
        for (var step of this.stepNodeMaps.values()) {
            step.clear();
        }
        this.stepNodeMaps.clear();
        for (var workbook of this.workbookNodeMaps.values()) {
            workbook.clear();
        }
        this.workbookNodeMaps.clear();
    }

    public getChildrenNodesById(id: string): AcmicpcNode[] {
        // The sub-category node's id is named as {Category.SubName}
        const metaInfo: string[] = id.split(".");
        const res: AcmicpcNode[] = [];
        let nodes: Map<string, AcmicpcNode> | undefined = undefined;
        switch (metaInfo[0]) {
            case Category.Class:
                nodes = this.classNodeMaps.get(metaInfo[1]);
                break;
            case Category.Step:
                nodes = this.stepNodeMaps.get(metaInfo[1]);
                break;
            case Category.Workbook:
                nodes = this.workbookNodeMaps.get(metaInfo[1]);
                break;
            default:
                break;
        }
        if (nodes != undefined) {
            return Array.from(nodes.values());
        }
        return res;
    }
}

export const explorerNodeManager: ExplorerNodeManager =
    new ExplorerNodeManager();
