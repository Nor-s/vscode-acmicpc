// Copyright (c) jdneo. All rights reserved.
// Licensed under the MIT license.

import * as _ from "lodash";
import { Disposable } from "vscode";
import { AcmicpcNode } from "./acmicpcNode";
import { Category, defaultProblem, ProblemState } from "../shared";
import {
    getStepNodeMap,
    getClassNodeMap,
    getWorkbookNodeMap,
} from "../commands/list";

class ExplorerNodeManager implements Disposable {
    private explorerNodeMap: Map<string, AcmicpcNode> = new Map<
        string,
        AcmicpcNode
    >();
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

    // TODO: 최적화
    public async refreshCache(): Promise<void> {
        this.dispose();
        this.classNodeMaps = await getClassNodeMap();
        this.stepNodeMaps = await getStepNodeMap();
        this.workbookNodeMaps = await getWorkbookNodeMap();

        // Set All
        for (const key of this.classNodeMaps.keys()) {
            const mp = this.classNodeMaps.get(key);
            if (mp != undefined) {
                for (const it of mp.keys()) {
                    const val = mp.get(it);
                    if (val != undefined) {
                        this.explorerNodeMap.set(it, val);
                    }
                }
            }
        }
        for (const key of this.stepNodeMaps.keys()) {
            const mp = this.stepNodeMaps.get(key);
            if (mp != undefined) {
                for (const it of mp.keys()) {
                    const val = mp.get(it);
                    if (val != undefined) {
                        this.explorerNodeMap.set(it, val);
                    }
                }
            }
        }
        for (const key of this.workbookNodeMaps.keys()) {
            const mp = this.workbookNodeMaps.get(key);
            if (mp != undefined) {
                for (const it of mp.keys()) {
                    const val = mp.get(it);
                    if (val != undefined) {
                        this.explorerNodeMap.set(it, val);
                    }
                }
            }
        }
    }

    public getRootNodes(): AcmicpcNode[] {
        return [
            new AcmicpcNode(
                Object.assign({}, defaultProblem, {
                    id: Category.All,
                    name: Category.All,
                }),
                false
            ),
            new AcmicpcNode(
                Object.assign({}, defaultProblem, {
                    id: Category.Class,
                    name: Category.Class,
                }),
                false
            ),
            new AcmicpcNode(
                Object.assign({}, defaultProblem, {
                    id: Category.Step,
                    name: Category.Step,
                }),
                false
            ),
            new AcmicpcNode(
                Object.assign({}, defaultProblem, {
                    id: Category.Workbook,
                    name: Category.Workbook,
                }),
                false
            ),
        ];
    }

    public getAllNodes(): AcmicpcNode[] {
        return Array.from(this.explorerNodeMap.values());
    }

    public getAllClassNodes(): AcmicpcNode[] {
        const res: AcmicpcNode[] = [];
        for (const className of this.classNodeMaps.keys()) {
            res.push(
                new AcmicpcNode(
                    Object.assign({}, defaultProblem, {
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
            res.push(
                new AcmicpcNode(
                    Object.assign({}, defaultProblem, {
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
            res.push(
                new AcmicpcNode(
                    Object.assign({}, defaultProblem, {
                        id: `${Category.Step}.${step}`,
                        name: _.startCase(step),
                    }),
                    false
                )
            );
        }
        return res;
    }

    public getNodeById(id: string): AcmicpcNode | undefined {
        return this.explorerNodeMap.get(id);
    }

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
        this.explorerNodeMap.clear();
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
