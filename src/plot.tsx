import { ParentProps, createContext, splitProps, useContext } from "solid-js";
import { Id, withBluefish, Group } from "@bluefish-js/solid";

export type Scale = any;

export type PlotProps = ParentProps<{
  name: Id;
  width?: number;
  height?: number;
  x?: Scale;
  y?: Scale;
  color?: Scale;
  data?: any;
}>;

export type PlotContextValue = {
  data?: any;
  scales: { [key in string /* Scale */]: any };
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
  return (
    <PlotContext.Provider
      value={{
        get data() {
          return props.data;
        },
        scales: {
          get x() {
            return props.x;
          },
          get y() {
            return props.y;
          },
          get color() {
            return props.color;
          },
        },
      }}
    >
      <Group>{props.children}</Group>
    </PlotContext.Provider>
  );
});
