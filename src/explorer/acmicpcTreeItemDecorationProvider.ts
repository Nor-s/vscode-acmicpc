import { URLSearchParams } from "url";
import {
  FileDecoration,
  FileDecorationProvider,
  ProviderResult,
  ThemeColor,
  Uri,
  workspace,
  WorkspaceConfiguration,
} from "vscode";

export class AcmicpcTreeItemDecorationProvider
  implements FileDecorationProvider
{
  private readonly DIFFICULTY_BADGE_LABEL: { [key: string]: string } = {
    "1": "AC",
    "2": "",
    "3": "",
  };

  private readonly ITEM_COLOR: { [key: string]: ThemeColor } = {
    "1": new ThemeColor("charts.green"), // ac
    "2": new ThemeColor("charts.red"), // not ac
    "3": new ThemeColor("charts.white"), // unknown
  };

  public provideFileDecoration(uri: Uri): ProviderResult<FileDecoration> {
    if (!this.isDifficultyBadgeEnabled()) {
      return;
    }

    if (uri.scheme !== "acmicpc" && uri.authority !== "problems") {
      return;
    }

    const params: URLSearchParams = new URLSearchParams(uri.query);
    const state: string = params.get("state")!.toLowerCase();
    return {
      badge: this.DIFFICULTY_BADGE_LABEL[state],
      color: this.ITEM_COLOR[state],
    };
  }

  private isDifficultyBadgeEnabled(): boolean {
    const configuration: WorkspaceConfiguration = workspace.getConfiguration();
    return configuration.get<boolean>("acmicpc.colorizeProblems", false);
  }
}

export const acmicpcTreeItemDecorationProvider: AcmicpcTreeItemDecorationProvider =
  new AcmicpcTreeItemDecorationProvider();
