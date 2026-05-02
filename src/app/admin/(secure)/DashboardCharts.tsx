"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from "recharts";

export type GrowthPoint = {
  date: string; // ISO yyyy-mm-dd
  label: string; // korte weergave: "12 mei"
  firms: number;
  jobs: number;
};

export type TopJobPoint = {
  name: string;
  views: number;
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg bg-white px-3 py-2 text-xs shadow-md ring-1 ring-gray-200">
      <div className="font-semibold text-gray-900">{label}</div>
      {payload.map((entry) => (
        <div key={entry.name} className="mt-0.5 flex items-center gap-2">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-gray-600">{entry.name}</span>
          <span className="ml-auto font-semibold text-gray-900">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function GrowthChart({ data }: { data: GrowthPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 16, left: -12, bottom: 0 }}
        >
          <defs>
            <linearGradient id="firmsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#587DFE" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#587DFE" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="jobsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22C6E0" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#22C6E0" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E5E7EB"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#6B7280" }}
            tickLine={false}
            axisLine={{ stroke: "#E5E7EB" }}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "#6B7280" }}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            iconType="circle"
            iconSize={8}
          />
          <Area
            type="monotone"
            dataKey="firms"
            name="Nieuwe werkgevers"
            stroke="#587DFE"
            strokeWidth={2}
            fill="url(#firmsGradient)"
            activeDot={{ r: 5 }}
          />
          <Area
            type="monotone"
            dataKey="jobs"
            name="Nieuwe vacatures"
            stroke="#22C6E0"
            strokeWidth={2}
            fill="url(#jobsGradient)"
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const BAR_COLORS = ["#4B3BD6", "#587DFE", "#22C6E0", "#7A8BF5", "#A8B6FF"];

export function TopJobsChart({ data }: { data: TopJobPoint[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center text-sm text-gray-400">
        Nog geen weergaven geregistreerd.
      </div>
    );
  }
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 24, left: 8, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#E5E7EB"
            horizontal={false}
          />
          <XAxis
            type="number"
            allowDecimals={false}
            tick={{ fontSize: 11, fill: "#6B7280" }}
            tickLine={false}
            axisLine={{ stroke: "#E5E7EB" }}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 12, fill: "#374151" }}
            tickLine={false}
            axisLine={false}
            width={160}
          />
          <Tooltip
            cursor={{ fill: "rgba(88, 125, 254, 0.08)" }}
            content={<CustomTooltip />}
          />
          <Bar dataKey="views" name="Weergaven" radius={[0, 6, 6, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
