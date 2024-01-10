import { For, Match, ParentProps, Switch, createEffect, createMemo } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { Rect, StackH, Group, withBluefish, Distribute, Align } from "@bluefish-js/solid";
import { usePlotContext } from "./plot";
import { createChannelFunction } from "./channelFunction";

export type BarProps<T> = ParentProps<
  Omit<JSX.RectSVGAttributes<SVGCircleElement>, "x" | "y" | "fill" | "width" | "height" | "label"> & {
    x: keyof T;
    x2?: keyof T;
    height?: keyof T;
    y?: keyof T;
    color?: keyof T;
    stroke?: keyof T;
    label?:
      | keyof T
      | {
          field: keyof T;
          avoid: Symbol[];
        };
    data?: T[];
    alignment?: "top" | "centerV" | "bottom" | "none";
    spacing?: number;
  }
>;

export const Bar = withBluefish(<T,>(props: BarProps<T>) => {
  const plotContext = usePlotContext();

  const data = () => props.data ?? plotContext.data;

  const channelFns = createMemo(() => ({
    x: createChannelFunction(props.x, plotContext.scales.x()),
    x2: createChannelFunction(props.x2, plotContext.scales.x()),
    height: createChannelFunction(props.height, plotContext.scales.y()),
    stroke: createChannelFunction(props.stroke, plotContext.scales.color()),
    color: createChannelFunction(props.color, plotContext.scales.color(), "black"),
  }));

  return (
    <Group x={0} y={0}>
      <Switch>
        <Match when={props.x2 !== undefined}>
          <Align alignment={props.alignment}>
            <For each={data()}>
              {(datum) => {
                return (
                  <Rect
                    shape-rendering="crispEdges"
                    x={channelFns().x(datum)}
                    width={channelFns().x2(datum) - channelFns().x(datum)}
                    height={channelFns().height(datum)}
                    fill={channelFns().color(datum)}
                    stroke={channelFns().stroke(datum)}
                  />
                );
              }}
            </For>
          </Align>
        </Match>
        <Match when={props.alignment === "none"}>
          <Distribute direction="horizontal" spacing={props.spacing ?? 5} total={1000}>
            <For each={data()}>
              {(datum) => {
                return (
                  <Rect
                    shape-rendering="crispEdges"
                    height={channelFns().height(datum)}
                    fill={channelFns().color(datum)}
                    stroke={channelFns().stroke(datum)}
                  />
                );
              }}
            </For>
          </Distribute>
        </Match>
        <Match when={true}>
          <StackH spacing={props.spacing ?? 5} total={1000} alignment={props.alignment ?? "bottom"}>
            <For each={data()}>
              {(datum) => {
                return (
                  <Rect
                    shape-rendering="crispEdges"
                    height={channelFns().height(datum)}
                    fill={channelFns().color(datum)}
                    stroke={channelFns().stroke(datum)}
                  />
                );
              }}
            </For>
          </StackH>
        </Match>
      </Switch>
    </Group>
  );
});
