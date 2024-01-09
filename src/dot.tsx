import { For, ParentProps, createMemo } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { Circle, Group, withBluefish } from "@bluefish-js/solid";
import { usePlotContext } from "./plot";
import { createChannelFunction } from "./channelFunction";

export type DotProps<T> = ParentProps<
  Omit<JSX.CircleSVGAttributes<SVGCircleElement>, "cx" | "cy" | "fill" | "width" | "height" | "label"> & {
    x: keyof T;
    y: keyof T;
    color?: keyof T;
    stroke?: keyof T;
    label?:
      | keyof T
      | {
          field: keyof T;
          avoid: Symbol[];
        };
    data?: T[];
  }
>;

export const Dot = withBluefish(<T,>(props: DotProps<T>) => {
  const plotContext = usePlotContext();

  // const resolvedX = () => plotContext.data.map((datum: any) => datum[props.x]);
  // const resolvedY = () => plotContext.data.map((datum: any) => datum[props.y]);
  // const resolvedColor = () =>
  //   plotContext.data.map((datum: any) => datum[props.color]);

  // const mappedX = () => resolvedX().map(plotContext.scales.x());
  // const mappedY = () => resolvedY().map(plotContext.scales.y());
  // const mappedColor = () => resolvedColor()?.map(plotContext.scales.color());

  const channelFns = createMemo(() => ({
    x: createChannelFunction(props.x),
    y: createChannelFunction(props.y),
    stroke: createChannelFunction(props.stroke),
    color: createChannelFunction(props.color, "black"),
  }));

  return (
    <Group x={0} y={0}>
      <For each={plotContext.data}>
        {(datum) => {
          return (
            <Circle
              cx={plotContext.scales.x()(channelFns().x(datum))}
              cy={plotContext.scales.y()(channelFns().y(datum))}
              fill={plotContext.scales.color()(channelFns().color(datum))}
              r={5}
            />
          );
        }}
      </For>
    </Group>
  );
});
