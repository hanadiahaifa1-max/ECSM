import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StageChartProps {
  data: Array<{
    stage: string;
    total: number;
    count: number;
  }>;
}

const stageColors: Record<string, string> = {
  "Initial Communication": "hsl(220, 13%, 50%)",
  Proposal: "hsl(217, 91%, 55%)",
  Negotiation: "hsl(280, 65%, 55%)",
  PoC: "hsl(187, 80%, 45%)",
  "Sign Agreement": "hsl(38, 92%, 50%)",
  "Closed Won": "hsl(142, 71%, 45%)",
  "Closed Lost": "hsl(0, 72%, 51%)",
};

const formatBillion = (value: number) => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}Bn`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(0)}Mn`;
  }
  return value.toString();
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-card p-4 shadow-lg">
        <p className="mb-2 font-semibold text-foreground">{label}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Total Value:</span>
            <span className="font-medium text-foreground">IDR {formatBillion(data.total)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Opportunities:</span>
            <span className="font-medium text-foreground">{data.count}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function StageChart({ data }: StageChartProps) {
  return (
    <Card className="glass-card animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-accent" />
          Pipeline by Stage
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tickFormatter={formatBillion}
                className="text-xs fill-muted-foreground"
              />
              <YAxis
                type="category"
                dataKey="stage"
                axisLine={false}
                tickLine={false}
                width={100}
                className="text-xs fill-muted-foreground"
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--muted))" }} />
              <Bar dataKey="total" radius={[0, 6, 6, 0]} maxBarSize={40}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={stageColors[entry.stage]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
