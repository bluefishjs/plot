import { ParentProps, createContext, createMemo, splitProps, useContext } from "solid-js";
import { Id, withBluefish, Group } from "@bluefish-js/solid";
import { Domain, mergeContinuousDomains } from "./domain";
import { SetStoreFunction, createStore } from "solid-js/store";
import { createScale } from "./scale";

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

export const Plot = withBluefish((props: PlotProps) => {
  const [domains, setDomains] = createStore<DomainMap>({});

  const yScale = createMemo(() => {
    let domain = [Infinity, -Infinity];
    for (const key in domains) {
      if (domains[key].y !== undefined) {
        domain = mergeContinuousDomains([domain, domains[key].y]);
      }
    }

    return props.y ?? (() => createScale("linear", domain, [props.height, 0]));
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
      <Group>{props.children}</Group>
    </PlotContext.Provider>
  );
});
