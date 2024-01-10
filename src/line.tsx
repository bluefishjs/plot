import { JSX } from "solid-js/jsx-runtime";
import { Encoding, createChannelFunction } from "./channelFunction";
import { Id, withBluefish, Group } from "@bluefish-js/solid";
import { usePlotContext } from "./plot";
import { createMemo } from "solid-js";
import { line, curveCatmullRom } from "d3-shape";
import Path from "./path";

export type LineProps<T> = Omit<JSX.LineSVGAttributes<SVGLineElement>, "x" | "y" | "fill" | "width" | "height"> & {
  name: Id;
  x: Encoding<T>;
  dx?: Encoding<T>;
  y: Encoding<T>;
  dy?: Encoding<T>;
  color?: string;
  data?: T[];
  curved?: boolean;
};

export const Line = withBluefish((props: LineProps<any>) => {
  const plotContext = usePlotContext();
  const data = () => props.data ?? plotContext.data;

  const channelFns = createMemo(() => ({
    x: createChannelFunction(props.x, plotContext.scales.x()),
    y: createChannelFunction(props.y, plotContext.scales.y()),
    dx: createChannelFunction(props.dx, plotContext.scales.x(), 0),
    dy: createChannelFunction(props.dy, plotContext.scales.y(), 0),
    // TODO: apply color and stroke attributes to path segments
    // color: createChannelFunction(props.color, plotContext.scales.color(), "black"),
    // stroke: createChannelFunction(props.stroke, plotContext.scales.color(), "black"),
  }));

  const d = () =>
    line().curve(curveCatmullRom)(
      data()
        .map(
          (datum: any) =>
            [channelFns().x(datum) + channelFns().dx(datum), channelFns().y(datum) + channelFns().dy(datum)] as [
              number,
              number
            ]
        )
        .filter((d: any) => d[0] !== undefined && d[1] !== undefined && !isNaN(d[0]) && !isNaN(d[1]))
    );

  return (
    <Group x={0} y={200}>
      <Path
        d={d()}
        // curved={props.curved} // curved unless otherwise specified
        fill={"none"}
        stroke={props.color ?? "black"}
        strokeWidth={+(props.stroke ?? 1.5)}
        strokeLinecap={"round"}
        strokeLinejoin={"round"}
        strokeMiterlimit={1}
      />
    </Group>
  );
});
Line.displayName = "Line";
