import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomAxisTick = ({ x, y, payload }: any) => {
  console.log(payload, "payload");
  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={16} textAnchor="end" fill="#666">
        {Intl.DateTimeFormat("en-US", {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "numeric",
        }).format(new Date(Number(payload.value)))}
      </text>
    </g>
  );
};

const Chart = ({
  id,
  data,
  height,
}: {
  id: string;
  height?: number;
  data?: { time: number; value: number }[];
}) => {
  const dataMax = Math.max(...(data?.map((i) => i.value) ?? []));
  const dataMin = Math.min(...(data?.map((i) => i.value) ?? []));
  const dataDifPercent = 1 / ((dataMax - dataMin) / dataMin);
  const gradientOffset = () => {
    const baseline = Number(data?.[0]?.value);

    return (dataMax - baseline) / (dataMax - dataMin);
  };
  const off = gradientOffset();
  return (
    <ResponsiveContainer width="100%" height={height ?? 400}>
      <AreaChart
        data={data?.map((d) => ({
          time: d.time,
          value: d.value,
        }))}
      >
        <XAxis
          axisLine={false}
          hide
          dataKey="time"
          tick={<CustomAxisTick />}
          tickLine={false}
          ticks={[
            data?.[Math.floor(data.length / 3)]?.time ?? "dataMin",
            data?.[data.length - 1]?.time ?? "dataMax",
          ]}
          type="category"
          domain={["auto", "auto"]}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          hide
          scale="log"
          domain={[
            `dataMin - ${Number(data?.[0]?.value) / dataDifPercent}`, // down dataDifPercent%
            `dataMax + ${Number(data?.[0]?.value) / dataDifPercent}`, // up dataDifPercent%
          ]}
          label={<></>}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "black",
            border: "none",
          }}
          labelFormatter={(label) => {
            const date = new Date(Number(label));
            if (date.toString() === "Invalid Date") {
              return label;
            } else {
              return Intl.DateTimeFormat("en-US", {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
              }).format(date);
            }
          }}
          formatter={(value) => {
            return [
              Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
                maximumSignificantDigits: 3,
              }).format(Number(value.toString())),
            ];
          }}
        />
        <defs>
          <linearGradient id={`splitColor-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4CAF50" stopOpacity={1} />
            <stop
              offset={off * 100 + "%"}
              stopColor="#4CAF50"
              stopOpacity={0}
            />
            <stop
              offset={off * 100 + "%"}
              stopColor="#F44336"
              stopOpacity={0}
            />
            <stop offset="100%" stopColor="#F44336" stopOpacity={1} />
          </linearGradient>
          <linearGradient id={`strokeColor-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset={off} stopColor="#4CAF50" stopOpacity={1} />
            <stop offset={off} stopColor="#F44336" stopOpacity={1} />
          </linearGradient>
        </defs>

        <Area
          type="monotone"
          baseValue={Number(data?.[0]?.value)}
          dataKey="value"
          stroke={dataMax === dataMin ? "#4CAF50" : `url(#strokeColor-${id})`}
          fill={`url(#splitColor-${id})`}
          yAxisId={0}
          dot={<></>}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default Chart;
