import { For, ParentProps, createMemo } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { Circle, Group, withBluefish } from "@bluefish-js/solid";
import { usePlotContext } from "./plot";
import { Encoding, createChannelFunction } from "./channelFunction";

export type DotProps<T> = ParentProps<
  Omit<JSX.CircleSVGAttributes<SVGCircleElement>, "cx" | "cy" | "fill" | "width" | "height" | "label"> & {
    x: Encoding<T>;
    y: Encoding<T>;
    color?: Encoding<T>;
    stroke?: Encoding<T>;
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

  const channelFns = createMemo(() => ({
    x: createChannelFunction(props.x, plotContext.scales.x()),
    y: createChannelFunction(props.y, plotContext.scales.y()),
    stroke: createChannelFunction(props.stroke, plotContext.scales.color()),
    color: createChannelFunction(props.color, plotContext.scales.color(), "black"),
  }));

  return (
    <Group x={0} y={0}>
      <For each={plotContext.data}>
        {(datum) => {
          return (
            <Circle cx={channelFns().x(datum)} cy={channelFns().y(datum)} fill={channelFns().color(datum)} r={5} />
          );
        }}
      </For>
    </Group>
  );
});
