import { For, Match, ParentProps, Switch, createEffect, createMemo } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { Rect, StackH, Group, withBluefish, Distribute, Align } from "@bluefish-js/solid";
import { usePlotContext } from "./plot";
import { createChannelFunction } from "./channelFunction";
import { data } from "./datasets/cars";

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
    x: createChannelFunction(props.x),
    x2: createChannelFunction(props.x2),
    height: createChannelFunction(props.height),
    stroke: createChannelFunction(props.stroke),
    color: createChannelFunction(props.color, "black"),
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
                    x={plotContext.scales.x()(channelFns().x(datum))}
                    width={
                      plotContext.scales.x()(channelFns().x2(datum)) - plotContext.scales.x()(channelFns().x(datum))
                    }
                    height={plotContext.scales.y()(channelFns().height(datum))}
                    fill={plotContext.scales.color()(channelFns().color(datum))}
                    stroke={plotContext.scales.color()(channelFns().stroke(datum))}
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
                    height={plotContext.scales.y()(channelFns().height(datum))}
                    fill={plotContext.scales.color()(channelFns().color(datum))}
                    stroke={plotContext.scales.color()(channelFns().stroke(datum))}
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
                    height={plotContext.scales.y()(channelFns().height(datum))}
                    fill={plotContext.scales.color()(channelFns().color(datum))}
                    stroke={plotContext.scales.color()(channelFns().stroke(datum))}
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
