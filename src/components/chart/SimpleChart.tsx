import {
  Line,
  Area,
  AreaChart,
  LineChart,
  CartesianGrid,
  Bar,
  BarChart,
  XAxis,
  YAxis,
  Rectangle,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const SimpleChart = () => {
  return (
    <Card className="w-full h-full">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2 [&>div]:flex-1">
        <div>
          <CardDescription>Likes Count</CardDescription>
          <CardTitle className="flex items-baseline gap-1 text-4xl tabular-nums">
            62
            <span className="text-sm font-normal tracking-normal text-muted-foreground"></span>
          </CardTitle>
        </div>
        <div>
          <CardDescription>Likes in the Giving Dates</CardDescription>
          <CardTitle className="flex items-baseline gap-1 text-4xl tabular-nums">
            35
            <span className="text-sm font-normal tracking-normal text-muted-foreground"></span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex items-center">
        <ChartContainer
          config={{
            resting: {
              label: "Resting",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="w-full"
        >
          <LineChart
            accessibilityLayer
            width={600} // Increased width
            height={450} // Increased height
            margin={{
              left: 20,
              right: 20,
              top: 20,
            }}
            data={[
              {
                date: "2024-01-01",
                resting: 62,
              },
              {
                date: "2024-01-02",
                resting: 72,
              },
              {
                date: "2024-01-03",
                resting: 35,
              },
              {
                date: "2024-01-04",
                resting: 62,
              },
              {
                date: "2024-01-05",
                resting: 52,
              },
              {
                date: "2024-01-06",
                resting: 62,
              },
              {
                date: "2024-01-07",
                resting: 70,
              },
            ]}
          >
            <CartesianGrid
              strokeDasharray="4 4"
              vertical={false}
              stroke="hsl(var(--muted-foreground))"
              strokeOpacity={0.5}
            />
            <YAxis hide domain={["dataMin - 10", "dataMax + 10"]} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                return new Date(value).toLocaleDateString("en-US", {
                  weekday: "short",
                });
              }}
            />
            <Line
              dataKey="resting"
              type="natural"
              fill="var(--color-resting)"
              stroke="var(--color-resting)"
              strokeWidth={2}
              dot={false}
              activeDot={{
                fill: "var(--color-resting)",
                stroke: "var(--color-resting)",
                r: 4,
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  indicator="line"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    });
                  }}
                />
              }
              cursor={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default SimpleChart;
