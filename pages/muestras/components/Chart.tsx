import React, { memo } from "react";
import dynamic from "next/dynamic";
// import Chart from "react-apexcharts";
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface Props {
  dataA: number[];
  dataB: number[];
  categories: string[];
}

const SampleChart: React.FC<Props> = memo(({ dataA, dataB, categories }) => {
  const series = [
    //data on the y-axis

    {
      name: "Etiqueta Calculada",
      data: dataA,
    },
    {
      name: "Etiqueta Observada",
      data: dataB,
    },
  ];
  const options = {
    //data on the x-axis

    chart: { id: "line" },
    zoom: {
      enabled: false,
    },
    colors: ['#eb1e88',  '#1ebbeb'],
    yaxis: {
      title: {
        text: "Posición Etiqueta",
      },
    },
    xaxis: {
      categories: categories,
    },
  };
  if (Chart) {
    return (
      <div>
        <Chart options={options} series={series} type="line" width="450" />
      </div>
    );
  } else {
    return null;
  }
});

export default SampleChart;
