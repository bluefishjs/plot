import { For, Match, ParentProps, Switch, createEffect, createMemo } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { Rect, StackH, Group, withBluefish, Distribute, Align } from "@bluefish-js/solid";
import { usePlotContext } from "./plot";
import { Encoding, createChannelFunction } from "./channelFunction";

export type BarProps<T> = ParentProps<
  Omit<JSX.RectSVGAttributes<SVGRectElement>, "x" | "y" | "fill" | "width" | "height" | "label"> & {
    x: Encoding<T>;
    x2?: Encoding<T>;
    height?: Encoding<T>;
    y?: Encoding<T>;
    color?: Encoding<T>;
    stroke?: Encoding<T>;
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

  createEffect(() => {
    console.log(data());
  });

  const channelFns = createMemo(() => ({
    x: createChannelFunction(props.x, plotContext.scales.x()),
    x2: createChannelFunction(props.x2, plotContext.scales.x()),
    height: createChannelFunction(props.height, (datum: any) => 500 - plotContext.scales.y()(datum)),
    stroke: createChannelFunction(props.stroke, plotContext.scales.color()),
    color: createChannelFunction(props.color, plotContext.scales.color(), "black"),
  }));

  // TODO: I can simplify this code by splitting out Align and Distribute from stack
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
