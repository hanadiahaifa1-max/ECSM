import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState } from "react";

interface ProductFamilyChartProps {
  data: Array<{
    name: string;
    value: number;
    count: number;
  }>;
}

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))", "hsl(var(--chart-6))"];

const formatBillion = (value: number) => {
  if (value >= 1000000000) {
    return `IDR ${(value / 1000000000).toFixed(1)}Bn`;
  }
  if (value >= 1000000) {
    return `IDR ${(value / 1000000).toFixed(0)}Mn`;
  }
  return `IDR ${value}`;
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-card p-4 shadow-lg">
        <p className="mb-2 font-semibold text-foreground">{data.name}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Value:</span>
            <span className="font-medium text-foreground">{formatBillion(data.value)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Deals:</span>
            <span className="font-medium text-foreground">{data.count}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-medium">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function ProductFamilyChart({ data }: ProductFamilyChartProps) {
  const [selectedProductFamily, setSelectedProductFamily] = useState<{
    name: string;
    value: number;
    count: number;
    percentage: number;
  } | null>(null);

  const handlePieClick = (data: any) => {
    if (data && data.payload) {
      const totalValue = data.reduce((sum: number, item: any) => sum + item.value, 0);
      const percentage = (data.payload.value / totalValue) * 100;
      setSelectedProductFamily({
        name: data.payload.name,
        value: data.payload.value,
        count: data.payload.count,
        percentage,
      });
    }
  };

  return (
    <Card className="glass-card animate-slide-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-info" />
          Pipeline by Product Family
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                outerRadius={100}
                innerRadius={40}
                paddingAngle={2}
                dataKey="value"
                onClick={handlePieClick}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              {/* <Tooltip content={<CustomTooltip />} /> */}
            </PieChart>
          </ResponsiveContainer>
        </div>
        {selectedProductFamily && (
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold text-sm mb-2">Selected Product Family: {selectedProductFamily.name}</h4>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Value:</span>
                <p className="font-medium">{formatBillion(selectedProductFamily.value)}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Deals:</span>
                <p className="font-medium">{selectedProductFamily.count}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Percentage:</span>
                <p className="font-medium">{selectedProductFamily.percentage.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        )}
        <div className="mt-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Family</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead className="text-right">Deals</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item, index) => (
                <TableRow key={item.name}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      {item.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">{formatBillion(item.value)}</TableCell>
                  <TableCell className="text-right">{item.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
