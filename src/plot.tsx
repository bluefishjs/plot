import { For, ParentProps, createContext, createMemo, splitProps, useContext } from "solid-js";
import { Id, withBluefish, Group, Text } from "@bluefish-js/solid";
import { Domain, mergeContinuousDomains } from "./domain";
import { SetStoreFunction, createStore } from "solid-js/store";
import { createScale } from "./scale";
import { ticks as d3Ticks } from "d3-array";

export type Scale = any;

export type PlotProps = ParentProps<{
  name: Id;
  width: number;
  height: number;
  x?: Scale;
  y?: Scale;
  color?: Scale;
  data?: any;
}>;

export type DomainMap = { [key in string]: { [key in string]: Domain } };

export type PlotContextValue = {
  data?: any;
  domains: DomainMap;
  setDomains: SetStoreFunction<DomainMap>;
  scales: { [key in string /* Scale */]: any };
  dims: { width: number; height: number };
};

export const PlotContext = createContext<PlotContextValue>();

export const usePlotContext = () => {
  const context = useContext(PlotContext);

  if (context === undefined) {
    throw new Error("This component must be used within a containing Plot component.");
  }

  return context;
};

export const Plot = withBluefish(
  (props: PlotProps) => {
    const [domains, setDomains] = createStore<DomainMap>({});

    const yScale = createMemo(() => {
      let domain = [Infinity, -Infinity];
      for (const key in domains) {
        if (domains[key].y !== undefined) {
          domain = mergeContinuousDomains([domain, domains[key].y]);
        }
      }

      return props.y ?? (() => createScale("linear", domain, [0, props.height]));
    });

    const ticks = createMemo(() => {
      return d3Ticks(yScale()().domain()[0], yScale()().domain()[1], 5);
    });

    return (
      <PlotContext.Provider
        value={{
          domains,
          setDomains,
          get data() {
            return props.data;
          },
          scales: {
            get x() {
              return props.x;
            },
            get y() {
              // return props.y;
              return yScale();
            },
            get color() {
              return props.color;
            },
          },
          dims: {
            get width() {
              return props.width;
            },
            get height() {
              return props.height;
            },
          },
        }}
      >
        <Group>
          {props.children}
          {/* <For each={ticks()}>
          {(tick) => (
            <Group y={yScale()(tick)}>
              <Text>{tick}</Text>
            </Group>
          )}
        </For> */}
        </Group>
      </PlotContext.Provider>
    );
  },
  { displayName: "Plot" }
);
