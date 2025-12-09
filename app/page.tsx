"use client";

import { useEffect, useRef, useState } from "react";
import { GridStack } from "gridstack";
import "gridstack/dist/gridstack.min.css";

type ChartData = {
  labels: string[];
  values: number[];
  originalMonths?: string[];
};

type Metric = {
  metric_type_id: number;
  metric_name: string;
  metric_description: string;
  unit: {
    unit_id: number;
    unit_code: string;
    unit_name: string;
    unit_symbol: string;
  };
  data: Array<{ month: string; value: number }>;
};

type Branch = {
  branch_id: number;
  branch_name: string;
  branch_code: string;
  city: string;
  status: string;
  metrics: Metric[];
};

type ApiResponse = {
  branches: Branch[];
};

type SortType = "none" | "month" | "value";

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
  chartNames: string[];
  unitSymbols: string[];
  visibleCharts: boolean[];
  sortTypes: SortType[];
  w?: number;
  h?: number;
  x?: number;
  y?: number;
  loading?: boolean;
};

const colors = [
  "bg-blue-100",
  "bg-green-100",
  "bg-purple-100",
  "bg-orange-100",
  "bg-pink-100",
  "bg-teal-100",
  "bg-yellow-100",
  "bg-indigo-100",
];

export default function Home() {
  const gridRef = useRef<HTMLDivElement>(null);
  const gridInstance = useRef<GridStack | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [cells, setCells] = useState<CellData[]>([]);
  const [loading, setLoading] = useState(true);

  const formatMonthLabel = (monthString: string) => {
    const date = new Date(monthString);
    return date.toLocaleDateString("tr-TR", {
      month: "short",
      year: "2-digit",
    });
  };

  const convertMetricsToChartData = (
    metrics: Array<{ month: string; value: number }>
  ): ChartData => {
    if (!Array.isArray(metrics) || metrics.length === 0) {
      return { labels: [], values: [], originalMonths: [] };
    }
    const labels = metrics.map((m) => formatMonthLabel(m.month));
    const values = metrics.map((m) => m.value);
    const originalMonths = metrics.map((m) => m.month);
    return { labels, values, originalMonths };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          "http://localhost:3001/api/data?months=12"
        );
        if (!response.ok) throw new Error("Failed to fetch data");
        const apiData: ApiResponse = await response.json();

        console.log(apiData);

        if (!apiData.branches || !Array.isArray(apiData.branches)) {
          throw new Error("Invalid data format");
        }

        setBranches(apiData.branches);

        const initialCells: CellData[] = apiData.branches.map(
          (branch: Branch, index: number) => {
            const metrics = branch.metrics || [];
            const chartDataMap: Record<number, ChartData> = {};
            const chartNamesMap: Record<number, string> = {};
            const unitSymbolsMap: Record<number, string> = {};

            metrics.forEach((metric) => {
              if (metric.data && Array.isArray(metric.data)) {
                chartDataMap[metric.metric_type_id] = convertMetricsToChartData(
                  metric.data
                );
                chartNamesMap[metric.metric_type_id] = metric.metric_name;
                unitSymbolsMap[metric.metric_type_id] =
                  metric.unit?.unit_symbol || "";
              }
            });

            const chartNames = [
              chartNamesMap[1] || "Metric 1",
              chartNamesMap[2] || "Metric 2",
              chartNamesMap[3] || "Metric 3",
              chartNamesMap[4] || "Metric 4",
              chartNamesMap[5] || "Metric 5",
              chartNamesMap[6] || "Metric 6",
            ];

            const unitSymbols = [
              unitSymbolsMap[1] || "",
              unitSymbolsMap[2] || "",
              unitSymbolsMap[3] || "",
              unitSymbolsMap[4] || "",
              unitSymbolsMap[5] || "",
              unitSymbolsMap[6] || "",
            ];

            return {
              id: branch.branch_id,
              name: branch.branch_name,
              visible: true,
              color: colors[index % colors.length],
              chartData1: chartDataMap[1] || {
                labels: [],
                values: [],
                originalMonths: [],
              },
              chartData2: chartDataMap[2] || {
                labels: [],
                values: [],
                originalMonths: [],
              },
              chartData3: chartDataMap[3] || {
                labels: [],
                values: [],
                originalMonths: [],
              },
              chartData4: chartDataMap[4] || {
                labels: [],
                values: [],
                originalMonths: [],
              },
              chartData5: chartDataMap[5] || {
                labels: [],
                values: [],
                originalMonths: [],
              },
              chartData6: chartDataMap[6] || {
                labels: [],
                values: [],
                originalMonths: [],
              },
              chartNames,
              unitSymbols,
              visibleCharts: [true, true, true, true, true, true],
              sortTypes: ["month", "month", "month", "month", "month", "month"],
              w: 6,
              h: 4,
              x: (index % 2) * 6,
              y: Math.floor(index / 2) * 5,
              loading: false,
            };
          }
        );

        setCells(initialCells);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!gridRef.current || cells.length === 0 || loading) return;

    if (gridInstance.current) {
      gridInstance.current.destroy(false);
      gridInstance.current = null;
    }

    const timeoutId = setTimeout(() => {
      if (!gridRef.current) return;

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
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (gridInstance.current) {
        gridInstance.current.destroy(false);
        gridInstance.current = null;
      }
    };
  }, [cells, loading]);

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

  const toggleSortType = (cellId: number, chartIndex: number) => {
    setCells((prev) =>
      prev.map((cell) => {
        if (cell.id === cellId) {
          const newSortTypes = [...cell.sortTypes];
          const currentSort = newSortTypes[chartIndex];
          if (currentSort === "month") {
            newSortTypes[chartIndex] = "value";
          } else if (currentSort === "value") {
            newSortTypes[chartIndex] = "none";
          } else {
            newSortTypes[chartIndex] = "month";
          }
          return { ...cell, sortTypes: newSortTypes };
        }
        return cell;
      })
    );
  };

  const getSortedChartData = (
    chartData: ChartData,
    sortType: SortType
  ): ChartData => {
    if (sortType === "none" || chartData.values.length === 0) {
      return chartData;
    }

    const indexed = chartData.labels.map((label, index) => ({
      label,
      value: chartData.values[index],
      originalMonth: chartData.originalMonths?.[index] || "",
      originalIndex: index,
    }));

    if (sortType === "month") {
      indexed.sort((a, b) => {
        const dateA = new Date(a.originalMonth);
        const dateB = new Date(b.originalMonth);
        return dateA.getTime() - dateB.getTime();
      });
    } else if (sortType === "value") {
      indexed.sort((a, b) => b.value - a.value);
    }

    return {
      labels: indexed.map((item) => item.label),
      values: indexed.map((item) => item.value),
      originalMonths: indexed.map((item) => item.originalMonth),
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-xl text-stone-600">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-200">
      <div className="bg-stone-200 shadow-md border-b border-stone-700">
        <div className="w-full px-4 py-4">
          <h1 className="text-xl font-bold mb-4 text-stone-800">
            CityTaste Restoran Zinciri
          </h1>
          <div className="flex gap-3 flex-wrap">
            {cells.map((cell) => {
              const getButtonColor = (colorClass: string) => {
                if (colorClass === "bg-blue-100")
                  return "bg-blue-500 hover:bg-blue-600";
                if (colorClass === "bg-green-100")
                  return "bg-green-500 hover:bg-green-600";
                if (colorClass === "bg-purple-100")
                  return "bg-purple-500 hover:bg-purple-600";
                if (colorClass === "bg-orange-100")
                  return "bg-orange-500 hover:bg-orange-600";
                if (colorClass === "bg-pink-100")
                  return "bg-pink-500 hover:bg-pink-600";
                if (colorClass === "bg-teal-100")
                  return "bg-teal-500 hover:bg-teal-600";
                if (colorClass === "bg-yellow-100")
                  return "bg-yellow-500 hover:bg-yellow-600";
                if (colorClass === "bg-indigo-100")
                  return "bg-indigo-500 hover:bg-indigo-600";
                return "bg-blue-500 hover:bg-blue-600";
              };
              return (
                <button
                  key={cell.id}
                  onClick={() => toggleCell(cell.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    cell.visible
                      ? `${getButtonColor(cell.color)} text-white`
                      : "bg-zinc-200 text-zinc-600 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-600"
                  }`}
                >
                  {cell.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="w-full px-2 py-4">
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

                  <div className="flex gap-1 flex-wrap mb-7 px-2">
                    {cell.chartNames.map((name, idx) => {
                      const chartColors = [
                        { bg: "bg-blue-500", hover: "hover:bg-blue-600" },
                        { bg: "bg-green-500", hover: "hover:bg-green-600" },
                        { bg: "bg-purple-500", hover: "hover:bg-purple-600" },
                        { bg: "bg-orange-500", hover: "hover:bg-orange-600" },
                        { bg: "bg-pink-500", hover: "hover:bg-pink-600" },
                        { bg: "bg-teal-500", hover: "hover:bg-teal-600" },
                      ];
                      const color = chartColors[idx] || chartColors[0];
                      const sortType = cell.sortTypes?.[idx] || "month";
                      const sortLabel =
                        sortType === "month"
                          ? "(Aylık)"
                          : sortType === "value"
                          ? "(Değer)"
                          : "";
                      return (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSortType(cell.id, idx);
                          }}
                          className={`px-1.5 py-0.5 rounded text-xs font-medium transition-all ${
                            sortType === "none"
                              ? "bg-zinc-300 text-zinc-600 hover:bg-zinc-400"
                              : cell.visibleCharts[idx]
                              ? `${color.bg} text-white ${color.hover}`
                              : "bg-zinc-300 text-zinc-600 hover:bg-zinc-400"
                          }`}
                        >
                          {name} {sortLabel}
                        </button>
                      );
                    })}
                  </div>

                  {cell.loading ? (
                    <div className="flex-1 flex items-center justify-center min-h-[280px]">
                      <div className="text-sm text-zinc-500">Yükleniyor...</div>
                    </div>
                  ) : (
                    (() => {
                      const visibleCount = cell.visibleCharts
                        .map((visible, idx) => {
                          if (!visible) return false;
                          const sortType = cell.sortTypes?.[idx] || "month";
                          return sortType !== "none";
                        })
                        .filter(Boolean).length;
                      let gridCols = "grid-cols-3";
                      let gap = "gap-3";

                      if (visibleCount === 1) {
                        gridCols = "grid-cols-1";
                        gap = "gap-0";
                      } else if (visibleCount === 2) {
                        gridCols = "grid-cols-2";
                        gap = "gap-2";
                      } else if (visibleCount === 3) {
                        gridCols = "grid-cols-3";
                        gap = "gap-1";
                      } else if (visibleCount === 4) {
                        gridCols = "grid-cols-2";
                        gap = "gap-2";
                      }

                      return (
                        <div
                          className={`grid ${gridCols} ${gap} flex-1 min-h-[280px] px-2 pb-2`}
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

                            const sortType =
                              cell.sortTypes?.[chartIndex] || "month";
                            if (sortType === "none") return null;

                            const sortedChartData = getSortedChartData(
                              chartData,
                              sortType
                            );

                            const chartColors = [
                              { bg: "bg-blue-500", hover: "hover:bg-blue-600" },
                              {
                                bg: "bg-green-500",
                                hover: "hover:bg-green-600",
                              },
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
                            const color = chartColors[chartIndex];
                            const chartName =
                              cell.chartNames[chartIndex] ||
                              `Metric ${chartIndex + 1}`;

                            if (sortedChartData.values.length === 0) {
                              return (
                                <div
                                  key={chartIndex}
                                  className="flex flex-col h-full min-h-[130px] gap-1 items-center justify-center"
                                >
                                  <h3 className="text-xs font-semibold text-zinc-700 px-1">
                                    {chartName}
                                  </h3>
                                  <div className="text-xs text-zinc-400">
                                    Veri yok
                                  </div>
                                </div>
                              );
                            }

                            return (
                              <div
                                key={chartIndex}
                                className="flex flex-col h-full min-h-[130px] gap-1"
                              >
                                <h3 className="text-xs font-semibold text-zinc-700 px-1">
                                  {chartName}
                                </h3>
                                <div className="flex-1 flex gap-[2px] min-h-[90px]">
                                  {sortedChartData.values.map(
                                    (value, index) => {
                                      const maxValue = Math.max(
                                        ...sortedChartData.values
                                      );
                                      const heightPercent =
                                        maxValue > 0
                                          ? (value / maxValue) * 100
                                          : 0;

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
                                              <span className="absolute -top-12 left-1/2 -translate-x-1/2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-white px-2 py-1 rounded whitespace-nowrap z-9999">
                                                <div className="text-center">
                                                  <div>
                                                    {
                                                      sortedChartData.labels[
                                                        index
                                                      ]
                                                    }
                                                  </div>
                                                  <div>
                                                    {value.toFixed(2)}
                                                    {cell.unitSymbols?.[
                                                      chartIndex
                                                    ]
                                                      ? ` ${cell.unitSymbols[chartIndex]}`
                                                      : ""}
                                                  </div>
                                                </div>
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    }
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
