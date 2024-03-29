import { withBluefish, StackH, StackV } from "@bluefish-js/solid";
import { usePlotContext, PlotContext, Plot } from "./plot";
import { For, JSX, createEffect, createMemo } from "solid-js";
export type GroupByProps<T> = {
  x?: keyof T;
  y?: keyof T;
  ySpacing?: number;
  data?: T[];
  children: () => JSX.Element;
};

export const GroupBy = withBluefish(
  <T,>(props: GroupByProps<T>) => {
    const plotContext = usePlotContext();

    const data = () => props.data ?? plotContext.data;

    // TODO: now we need nested coordinate systems/scales! let's ignore that for now... it might start
    // to become necessary when we introduce axes and legends...

    // grouped data is a nested array so that it can be used in the grid defined below
    // `x` specifies the values in each row
    // `y` specifies the values in each column
    // `x` and `y` might be optional, in which case there is only one row or column, respectively
    // e.g.:
    /* 
  Input data:
  const tinyData: {
  Fruit: string;
  Contestant: string;
  "Number Eaten": number;
}[] = [
  { Fruit: "Apples", Contestant: "Alex", "Number Eaten": 2 },
  { Fruit: "Apples", Contestant: "Jordan", "Number Eaten": 1 },
  { Fruit: "Bananas", Contestant: "Alex", "Number Eaten": 3 },
  { Fruit: "Bananas", Contestant: "Jordan", "Number Eaten": 2 },
  { Fruit: "Oranges", Contestant: "Alex", "Number Eaten": 1 },
  { Fruit: "Oranges", Contestant: "Jordan", "Number Eaten": 3 },
];

  GroupBy x="Fruit" y="Contestant"

  groupedData = [
    [[{ Fruit: "Apples", Contestant: "Alex", "Number Eaten": 2 }], [{ Fruit: "Bananas", Contestant: "Alex", "Number Eaten": 3 }], [{ Fruit: "Oranges", Contestant: "Alex", "Number Eaten": 1 }]],
    [[{ Fruit: "Apples", Contestant: "Jordan", "Number Eaten": 1 }], [{ Fruit: "Bananas", Contestant: "Jordan", "Number Eaten": 2 }], [{ Fruit: "Oranges", Contestant: "Jordan", "Number Eaten": 3 }]]
  ]

  GroupBy x="Fruit" y=undefined

  groupedData = [
    [
      [{ Fruit: "Apples", Contestant: "Alex", "Number Eaten": 2 }, { Fruit: "Apples", Contestant:
    "Jordan", "Number Eaten": 1 }],
      [{ Fruit: "Bananas", Contestant: "Alex", "Number Eaten": 3 }, { Fruit: "Bananas", Contestant: "Jordan", "Number Eaten": 2 }],
      [{ Fruit: "Oranges", Contestant: "Alex", "Number Eaten": 1 }, { Fruit: "Oranges", Contestant: "Jordan", "Number Eaten": 3 }]
    ]
  ]
  */
    const groupedData = createMemo(() => {
      const groupedData: T[][][] = [];
      const x = props.x;
      const y = props.y;

      if (x !== undefined && y !== undefined) {
        const xValues = new Set(data().map((d) => d[x]));
        const yValues = new Set(data().map((d) => d[y]));

        for (const xValue of xValues) {
          const row: T[][] = [];
          for (const yValue of yValues) {
            row.push(data().filter((d) => d[x] === xValue && d[y] === yValue));
          }
          groupedData.push(row);
        }
      } else if (x !== undefined) {
        const xValues = new Set(data().map((d) => d[x]));
        for (const xValue of xValues) {
          groupedData.push([data().filter((d) => d[x] === xValue)]);
        }
      } else if (y !== undefined) {
        const yValues = new Set(data().map((d) => d[y]));
        groupedData.push([]);
        for (const yValue of yValues) {
          groupedData[0].push(data().filter((d) => d[y] === yValue));
        }
      } else {
        groupedData.push([data()]);
      }

      // console.log(groupedData);

      return groupedData;
    });

    return (
      <StackH alignment="bottom" total={plotContext.dims.width}>
        <For each={groupedData()}>
          {(col) => (
            <StackV spacing={props.ySpacing ?? 10} /* total={plotContext.dims.height} */>
              <For each={col}>
                {(datum) => {
                  return (
                    // <PlotContext.Provider
                    //   value={{
                    //     domains: plotContext.domains,
                    //     setDomains: plotContext.setDomains,
                    //     get data() {
                    //       return datum;
                    //     },
                    //     scales: plotContext.scales,
                    //     dims: {
                    //       width: plotContext.dims.width / groupedData().length - 10,
                    //       height: plotContext.dims.height / col.length,
                    //     },
                    //   }}
                    // >
                    //   {props.children()}
                    // </PlotContext.Provider>
                    <Plot
                      data={datum}
                      width={plotContext.dims.width / groupedData().length - 10}
                      height={(plotContext.dims.height - (props.ySpacing ?? 10) * (col.length - 1)) / col.length}
                      x={plotContext.scales.x}
                      // y={plotContext.scales.y}
                      color={plotContext.scales.color}
                    >
                      {props.children()}
                    </Plot>
                  );
                }}
              </For>
            </StackV>
          )}
        </For>
      </StackH>
    );
  },
  { displayName: "GroupBy" }
);
