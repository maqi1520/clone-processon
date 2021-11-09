import { type } from "os";
import { Interface } from "readline";

export declare module DigramingMessage {
  export interface Attribute {
    container: boolean;
    visible: boolean;
    rotatable: boolean;
    linkable: boolean;
    collapsable: boolean;
    collapsed: boolean;
    markerOffset: number;
  }

  export interface DataAttribute {
    name: string;
    type: string;
    value: string;
    category: string;
    id: string;
  }

  export interface Props {
    x: number;
    y: number;
    w: number;
    h: number;
    zindex: number;
    angle: number;
  }

  export interface ShapeStyle {
    alpha: number;
  }

  export interface LineStyle {}

  export interface FillStyle {}

  export interface Theme {}

  export interface Action {
    action: string;
    x: string;
    y: string;
  }

  export interface Path {
    actions: Action[];
  }

  export interface FontStyle {}

  export interface Position {
    x: number;
    y: number;
    w: string;
    h: string;
  }

  export interface TextBlock {
    position: Position;
    text: string;
  }

  export interface Anchor {
    x: string;
    y: string;
  }

  export interface Content {
    id: string;
    name: string;
    title: string;
    category: string;
    group: string;
    groupName?: any;
    locked: boolean;
    link: string;
    children: any[];
    parent: string;
    resizeDir: string[];
    attribute: Attribute;
    dataAttributes: DataAttribute[];
    props: Props;
    shapeStyle: ShapeStyle;
    lineStyle: LineStyle;
    fillStyle: FillStyle;
    theme: Theme;
    path: Path[];
    fontStyle: FontStyle;
    textBlock: TextBlock[];
    anchors: Anchor[];
  }

  export interface UpdateContent {
    shapes: Record<string, string>[];
    updates: Content[];
  }

  export interface PageContent {
    page: Record<string, string>;
    update: Record<string, string>;
  }

  export interface ThemeContent {
    theme: Record<string, string>;
    update: Record<string, string>;
  }

  export type Message =
    | {
        action: "create" | "remove";
        content: Content[];
      }
    | {
        action: "update";
        content: UpdateContent;
      }
    | {
        action: "updatePage";
        content: PageContent;
      }
    | {
        action: "setTheme";
        content: ThemeContent;
      };

  export interface UserAction {
    action: string;
    title: string;
    messages: Message[];
    name: string;
  }
  export type UserActions = UserAction[];
}
