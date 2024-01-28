import { For, Match, ParentProps, Switch, createEffect, createMemo, createUniqueId } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { Rect, StackH, Group, withBluefish, Distribute, Align, StackV } from "@bluefish-js/solid";
import { usePlotContext } from "./plot";
import { Encoding, createChannelFunction, createDataFunction } from "./channelFunction";
import { computeDomain, discreteOrContinuous, mergeContinuousDomains } from "./domain";

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

/* What are the rules of Bar?
Goals:
- We want the rules to be as simple as possible

- If height is defined and y is not defined, then y is assumed to be 0
- If height and y are both continuous, then they are assumed to be in the same coordinate space.
  (Should we actually assume this?) The big question is how do we represent Gantt charts that use
  start time and duration? Or should we just force people to use y2 for that? But how would we
  compute the height scale if it's independent?
- If height is continuous and y is discrete, then y is assumed to be the bottom of the bar and we
  expect stacked bars
- y2 and height cannot be simultaneously defined
- y and y2 should definitely be assumed to be in the same coordinate space. Maybe this means we
  _should not_ assume that height and y are in the same coordinate space.


Maybe we should somehow work out a way to define what y + height means if y is discrete and height
is continuous? Maybe there are some universal rules we can come up with for that.

(y: c) + (height: c) := they are both in the same coordinate space and the scale range is
determined by the maximum sum over all data points. This happens in e.g. a continuous gantt chart.
(y: d) + (height: c) := they are in different coordinate spaces and the scale range is determined by
the total height of the bars
(y: c) + (height: d) := this does not seem meaningful b/c we have a discrete coordinate space
embedded in a continuous coordinate space
(y: d) + (height: d) := this does not seem meaningful

Aha! height is always continuous, but y can be either continuous or discrete. If y is continuous,
then we assume that it is in the same coordinate space as height. If y is discrete, then we assume
that it is in a different coordinate space from height. In this case, we assume that the height
scale is determined by the total height of the bars.

The reason height cannot be discrete is that it inherently represents ratios. If we have a discrete
height, even if that space is ordered, we are still representing ratios. This is not meaningful.
This is not true of relative positions! Isn't that neat.
*/

export const Bar = withBluefish(<T,>(props: BarProps<T>) => {
  // TODO: maintain a context of domains mapped to ids so that we can merge domains across all marks
  // and update them when needed. Then the parent Plot can compute the domains and pass them down to
  // the marks.
  const id = createUniqueId();

  createEffect(() => {
    plotContext.setDomains(id, {});
  });

  const plotContext = usePlotContext();

  const data = () => props.data ?? plotContext.data;

  const dataFns = createMemo(() => ({
    x: createDataFunction(props.x),
    x2: createDataFunction(props.x2),
    y: createDataFunction(props.y),
    height: createDataFunction(props.height),
    stroke: createDataFunction(props.stroke),
    color: createDataFunction(props.color),
  }));

  const xDomain = createMemo(() => {
    return mergeContinuousDomains([computeDomain(data(), dataFns().x), computeDomain(data(), dataFns().x2)]);
  });

  createEffect(() => {
    plotContext.setDomains(id, "x", xDomain());
  });

  const yDomain = createMemo(() => {
    if (props.y === undefined) {
      return mergeContinuousDomains([[0, 0], computeDomain(data(), (datum: any) => dataFns().height(datum))]);
    }

    switch (discreteOrContinuous(dataFns().y(data()[0]))) {
      case "discrete":
        // if y is discrete and height is defined, then we have a stacked bar chart so take sum over heights
        return [
          0,
          data()
            .map((datum: any) => dataFns().height(datum))
            .reduce((a: number, b: number) => a + b, 0),
        ];
      case "continuous":
        // if y is continuous and height is defined, then we have independently placed bars so take
        // max over y + height
        return computeDomain(data(), (datum: any) => dataFns().y(datum) + dataFns().height(datum));
    }
    // return mergeContinuousDomains([
    //   [0, 0], // always include 0 in the domain. TODO: this should only happen if height is defined I think... and if y is continuous or undefined
    //   computeDomain(data(), dataFns().y),
    // ]);
  });

  createEffect(() => {
    plotContext.setDomains(id, "y", yDomain());
  });

  const channelFns = createMemo(() => ({
    x: createChannelFunction(props.x, plotContext.scales.x()),
    x2: createChannelFunction(props.x2, plotContext.scales.x()),
    y: createChannelFunction(props.y, plotContext.scales.y()),
    height: createChannelFunction(props.height, plotContext.scales.y()),
    stroke: createChannelFunction(props.stroke, plotContext.scales.color()),
    color: createChannelFunction(props.color, plotContext.scales.color(), "black"),
  }));

  const groupedData = createMemo(() => {
    const groupedData: T[][] = [];
    const x = props.x;
    const y = props.y;

    if (x !== undefined && y !== undefined) {
      const xValues = new Set(data().map((d) => d[x]));
      const yValues = new Set(data().map((d) => d[y]));

      for (const xValue of xValues) {
        const row: T[] = [];
        for (const yValue of yValues) {
          row.push(data().filter((d) => d[x] === xValue && d[y] === yValue)[0]);
        }
        groupedData.push(row);
      }
    } else if (x !== undefined) {
      const xValues = new Set(data().map((d) => d[x]));
      for (const xValue of xValues) {
        groupedData.push(data().filter((d) => d[x] === xValue));
      }
    } else if (y !== undefined) {
      const yValues = new Set(data().map((d) => d[y]));
      groupedData.push([]);
      for (const yValue of yValues) {
        groupedData[0].push(data().filter((d) => d[y] === yValue)[0]);
      }
    } else {
      groupedData.push([data()]);
    }

    return groupedData;
  });

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
          <Distribute direction="horizontal" spacing={props.spacing ?? 5} total={plotContext.dims.width}>
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
          <StackH spacing={props.spacing ?? 5} total={plotContext.dims.width} alignment={props.alignment ?? "bottom"}>
            <For each={groupedData()}>
              {(row) =>
                // make a column for each unique xValue
                {
                  return (
                    <StackV spacing={0} alignment="centerX">
                      <For each={row}>
                        {/* this column contains the yValues associated with the xValue */}
                        {(datum) => {
                          return (
                            <Rect
                              width={80}
                              shape-rendering="crispEdges"
                              height={channelFns().height(datum)}
                              fill={channelFns().color(datum)}
                              stroke={channelFns().stroke(datum)}
                            />
                          );
                        }}
                      </For>
                    </StackV>
                  );
                }
              }
            </For>
          </StackH>
          {/* <StackH alignment="bottom" total={plotContext.dims.width}>
            <For each={groupedData()}>
              {(col) => (
                <StackH alignment="bottom" total={plotContext.dims.width}>
                  <For each={col}>
                    {(subcol) => (
                      <StackV spacing={0}>
                        <For each={subcol}>
                          {(datum) => {
                            return (
                              <Rect
                                width={80}
                                shape-rendering="crispEdges"
                                height={channelFns().height(datum)}
                                fill={channelFns().color(datum)}
                                stroke={channelFns().stroke(datum)}
                              />
                            );
                          }}
                        </For>
                      </StackV>
                    )}
                  </For>
                </StackH>
              )}
            </For>
          </StackH> */}
        </Match>
        {/* <Match when={true}>
          <StackH spacing={props.spacing ?? 5} total={plotContext.dims.width} alignment={props.alignment ?? "bottom"}>
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
        </Match> */}
      </Switch>
    </Group>
  );
});
