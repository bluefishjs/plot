import { JSX } from "solid-js/jsx-runtime";
import { Encoding, createChannelFunction } from "./channelFunction";
import { Id, withBluefish, Group } from "@bluefish-js/solid";
import { usePlotContext } from "./plot";
import { createMemo } from "solid-js";
import { line, curveCatmullRom } from "d3-shape";
import Path from "./path";
import { PaperScope } from "paper";

export type LineProps<T> = Omit<JSX.LineSVGAttributes<SVGLineElement>, "x" | "y" | "fill" | "width" | "height"> & {
  name: Id;
  x: Encoding<T>;
  dx?: Encoding<T>;
  y: Encoding<T>;
  height?: Encoding<T>;
  dy?: Encoding<T>;
  color?: string;
  data?: T[];
  curved?: boolean;
  opacity?: number;
};

export const Line = withBluefish((props: LineProps<any>) => {
  const plotContext = usePlotContext();
  const data = () => props.data ?? plotContext.data;

  const canvas = document.createElement("canvas");
  const paperScope = new PaperScope();
  paperScope.setup(canvas);

  const channelFns = createMemo(() => ({
    x: createChannelFunction(props.x, plotContext.scales.x()),
    y: createChannelFunction(props.y, plotContext.scales.y()),
    height: createChannelFunction(props.height, plotContext.scales.y()),
    dx: createChannelFunction(props.dx, plotContext.scales.x(), 0),
    dy: createChannelFunction(props.dy, plotContext.scales.y(), 0),
    // TODO: apply color and stroke attributes to path segments
    // color: createChannelFunction(props.color, plotContext.scales.color(), "black"),
    // stroke: createChannelFunction(props.stroke, plotContext.scales.color(), "black"),
  }));

  const lineData = createMemo(() =>
    data()
      .map(
        (datum: any) =>
          [
            channelFns().x(datum) + channelFns().dx(datum),
            (channelFns().height(datum) !== undefined ? channelFns().height(datum) : channelFns().y(datum)) +
              channelFns().dy(datum),
          ] as [number, number]
      )
      .filter((d: any) => d[0] !== undefined && d[1] !== undefined && !isNaN(d[0]) && !isNaN(d[1]))
  );

  const d = () => line().curve(curveCatmullRom)(lineData()) ?? "";

  const path = createMemo(() => {
    const path = new paperScope.Path(d());
    if (props.height !== undefined) {
      path.add(new paperScope.Point(lineData()[lineData().length - 1][0], plotContext.scales.y()(0)));
      path.add(new paperScope.Point(lineData()[0][0], plotContext.scales.y()(0)));
      path.closePath();
    }
    return path;
  });

  return (
    <Path
      position="absolute"
      d={path().pathData}
      // curved={props.curved} // curved unless otherwise specified
      stroke={props.color ?? "black"}
      strokeWidth={+(props.stroke ?? 1.5)}
      strokeLinecap={"round"}
      strokeLinejoin={"round"}
      strokeMiterlimit={1}
      fill={props.height !== undefined ? props.color ?? "black" : "none"}
      opacity={props.opacity}
    />
  );
});
Line.displayName = "Line";
