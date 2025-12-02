"use client";

import { useEffect, useRef, useState } from "react";
import { GridStack } from "gridstack";
import "gridstack/dist/gridstack.min.css";

type ChartData = {
  labels: string[];
  values: number[];
};

type CellData = {
  id: number;
  name: string;
  visible: boolean;
  color: string;
  chartData1: ChartData;
  chartData2: ChartData;
  chartData3: ChartData;
  chartData4: ChartData;
  chartData5: ChartData;
  chartData6: ChartData;
  visibleCharts: boolean[];
  w?: number;
  h?: number;
  x?: number;
  y?: number;
};

export default function Home() {
  const gridRef = useRef<HTMLDivElement>(null);
  const gridInstance = useRef<GridStack | null>(null);

  const generateMonthlyData = () => {
    const months = [];
    const values = [];
    const now = new Date();

    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString("tr-TR", {
        month: "short",
        year: "2-digit",
      });
      months.push(monthName);
      values.push(Math.floor(Math.random() * 100) + 20);
    }

    return { labels: months, values };
  };

  const [cells, setCells] = useState<CellData[]>([
    {
      id: 1,
      name: "Uskudar",
      visible: true,
      color: "bg-blue-100",
      chartData1: generateMonthlyData(),
      chartData2: generateMonthlyData(),
      chartData3: generateMonthlyData(),
      chartData4: generateMonthlyData(),
      chartData5: generateMonthlyData(),
      chartData6: generateMonthlyData(),
      visibleCharts: [true, true, true, true, true, true],
      w: 6,
      h: 4,
      x: 0,
      y: 0,
    },
    {
      id: 2,
      name: "Nisantasi",
      visible: true,
      color: "bg-green-100",
      chartData1: generateMonthlyData(),
      chartData2: generateMonthlyData(),
      chartData3: generateMonthlyData(),
      chartData4: generateMonthlyData(),
      chartData5: generateMonthlyData(),
      chartData6: generateMonthlyData(),
      visibleCharts: [true, true, true, true, true, true],
      w: 6,
      h: 4,
      x: 6,
      y: 0,
    },
    {
      id: 3,
      name: "Bornova",
      visible: true,
      color: "bg-purple-100",
      chartData1: generateMonthlyData(),
      chartData2: generateMonthlyData(),
      chartData3: generateMonthlyData(),
      chartData4: generateMonthlyData(),
      chartData5: generateMonthlyData(),
      chartData6: generateMonthlyData(),
      visibleCharts: [true, true, true, true, true, true],
      w: 6,
      h: 4,
      x: 0,
      y: 5,
    },
    {
      id: 4,
      name: "Beypazari",
      visible: true,
      color: "bg-orange-100",
      chartData1: generateMonthlyData(),
      chartData2: generateMonthlyData(),
      chartData3: generateMonthlyData(),
      chartData4: generateMonthlyData(),
      chartData5: generateMonthlyData(),
      chartData6: generateMonthlyData(),
      visibleCharts: [true, true, true, true, true, true],
      w: 6,
      h: 4,
      x: 6,
      y: 5,
    },
  ]);

  useEffect(() => {
    if (gridRef.current && !gridInstance.current) {
      gridInstance.current = GridStack.init(
        {
          column: 12,
          cellHeight: 100,
          margin: 0,
          float: false,
          minRow: 1,
          resizable: {
            handles: "all",
          },
        },
        gridRef.current
      );
    }

    return () => {
      if (gridInstance.current) {
        gridInstance.current.destroy(false);
        gridInstance.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (gridInstance.current) {
      const grid = gridInstance.current;

      requestAnimationFrame(() => {
        const allElements =
          gridRef.current?.querySelectorAll(".grid-stack-item");
        allElements?.forEach((el) => {
          if (!el.classList.contains("grid-stack-item")) return;
          grid.makeWidget(el as HTMLElement);
        });
      });
    }
  }, [cells]);

  const toggleCell = (id: number) => {
    setCells((prev) =>
      prev.map((cell) => {
        if (cell.id === id) {
          if (cell.visible && gridInstance.current) {
            const node = gridRef.current?.querySelector(`[gs-id="${cell.id}"]`);
            if (node) {
              const gridNode = gridInstance.current.engine.nodes.find(
                (n) => n.el === node
              );
              if (gridNode) {
                return {
                  ...cell,
                  visible: false,
                  w: gridNode.w,
                  h: gridNode.h,
                  x: gridNode.x,
                  y: gridNode.y,
                };
              }
            }
          }
          return { ...cell, visible: !cell.visible };
        }
        return cell;
      })
    );
  };

  const toggleChartVisibility = (cellId: number, chartIndex: number) => {
    setCells((prev) =>
      prev.map((cell) => {
        if (cell.id === cellId) {
          const newVisibleCharts = [...cell.visibleCharts];
          newVisibleCharts[chartIndex] = !newVisibleCharts[chartIndex];
          return { ...cell, visibleCharts: newVisibleCharts };
        }
        return cell;
      })
    );
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="bg-white dark:bg-zinc-800 shadow-md border-b border-zinc-200 dark:border-zinc-700">
        <div className="w-full px-4 py-4">
          <h1 className="text-xl font-bold mb-4 text-zinc-900 dark:text-zinc-100">
            GridStack Dashboard
          </h1>
          <div className="flex gap-3 flex-wrap">
            {cells.map((cell) => (
              <button
                key={cell.id}
                onClick={() => toggleCell(cell.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  cell.visible
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-zinc-200 text-zinc-600 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600"
                }`}
              >
                {cell.name} {cell.visible ? "✓" : "✕"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-6">
        <div ref={gridRef} className="grid-stack">
          {cells
            .filter((cell) => cell.visible)
            .map((cell) => (
              <div
                key={cell.id}
                className="grid-stack-item"
                gs-id={cell.id}
                gs-w={cell.w}
                gs-h={cell.h}
                gs-min-w="5"
                gs-min-h="4"
                gs-x={cell.x}
                gs-y={cell.y}
              >
                <div
                  className={`grid-stack-item-content ${cell.color} rounded-lg shadow-lg border border-zinc-300 dark:border-zinc-600 flex flex-col h-full overflow-auto`}
                >
                  <div className="flex items-center justify-between mb-1 px-2 pt-2">
                    <h2 className="text-lg font-bold text-black">
                      {cell.name}
                    </h2>
                    <button
                      onClick={() => toggleCell(cell.id)}
                      className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-100 text-zinc-600 hover:text-red-600 transition-colors"
                      title="Close panel"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="flex gap-1 flex-wrap mb-2 px-2">
                    {[
                      "Chart 1",
                      "Chart 2",
                      "Chart 3",
                      "Chart 4",
                      "Chart 5",
                      "Chart 6",
                    ].map((name, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleChartVisibility(cell.id, idx)}
                        className={`px-1.5 py-0.5 rounded text-xs font-medium transition-all ${
                          cell.visibleCharts[idx]
                            ? "bg-zinc-800 text-white"
                            : "bg-zinc-300 text-zinc-600 hover:bg-zinc-400"
                        }`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>

                  {(() => {
                    const visibleCount =
                      cell.visibleCharts.filter(Boolean).length;
                    let gridCols = "grid-cols-3";

                    if (visibleCount === 1) {
                      gridCols = "grid-cols-1";
                    } else if (visibleCount === 2 || visibleCount === 4) {
                      gridCols = "grid-cols-2";
                    }

                    return (
                      <div
                        className={`grid ${gridCols} gap-3 flex-1 min-h-[280px] px-2 pb-2`}
                      >
                        {[
                          cell.chartData1,
                          cell.chartData2,
                          cell.chartData3,
                          cell.chartData4,
                          cell.chartData5,
                          cell.chartData6,
                        ].map((chartData, chartIndex) => {
                          if (!cell.visibleCharts[chartIndex]) return null;

                          const chartColors = [
                            { bg: "bg-blue-500", hover: "hover:bg-blue-600" },
                            { bg: "bg-green-500", hover: "hover:bg-green-600" },
                            {
                              bg: "bg-purple-500",
                              hover: "hover:bg-purple-600",
                            },
                            {
                              bg: "bg-orange-500",
                              hover: "hover:bg-orange-600",
                            },
                            { bg: "bg-pink-500", hover: "hover:bg-pink-600" },
                            { bg: "bg-teal-500", hover: "hover:bg-teal-600" },
                          ];
                          const chartNames = [
                            "Chart 1",
                            "Chart 2",
                            "Chart 3",
                            "Chart 4",
                            "Chart 5",
                            "Chart 6",
                          ];
                          const color = chartColors[chartIndex];
                          const chartName = chartNames[chartIndex];

                          return (
                            <div
                              key={chartIndex}
                              className="flex flex-col h-full min-h-[130px] gap-1"
                            >
                              <h3 className="text-xs font-semibold text-zinc-700 px-1">
                                {chartName}
                              </h3>
                              <div className="flex-1 flex gap-[2px] min-h-[90px]">
                                {chartData.values.map((value, index) => {
                                  const maxValue = Math.max(
                                    ...chartData.values
                                  );
                                  const heightPercent =
                                    (value / maxValue) * 100;

                                  return (
                                    <div
                                      key={index}
                                      className="flex-1 flex flex-col items-center"
                                    >
                                      <div className="relative w-full flex-1 flex items-end min-h-[50px]">
                                        <div
                                          className={`w-full ${color.bg} ${color.hover} rounded-t transition-all relative group`}
                                          style={{
                                            height: `${heightPercent}%`,
                                          }}
                                        >
                                          <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[8px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white px-1 py-0.5 rounded whitespace-nowrap z-10">
                                            {value}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
