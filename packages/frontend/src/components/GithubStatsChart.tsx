"use client";

import { Chart } from "react-google-charts";

type Props = {
  stars: number;
  forks: number;
  commits: number;
};

export default function GithubStatsChart({
  stars,
  forks,
  commits,
}: Props) {
  const data = [
    ["Metric", "Count"],
    ["Stars", stars],
    ["Forks", forks],
    ["Commits", commits],
  ];

  const options = {
    title: "Repository Statistics",
    legend: { position: "none" },
    chartArea: { width: "60%" },
    hAxis: {
      minValue: 0,
    },
  };

  return (
    <Chart
      chartType="BarChart"
      width="100%"
      height="300px"
      data={data}
      options={options}
    />
  );
}