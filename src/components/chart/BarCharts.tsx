import { Bar, BarChart, XAxis, Rectangle } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";

const BarCharts = () => {
  return (
    <Card className="w-[500px] mb-[2px] h-full flex flex-col">
      <CardHeader className="p-4 pb-0">
        <CardTitle>Comments/Shares Chart</CardTitle>
        <CardDescription>
          Here is your Stats through the Dates Provided
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow p-4 pt-0">
        <div className="flex items-baseline gap-1 text-3xl font-bold tabular-nums leading-none">
          100
          <span className="text-sm font-normal text-muted-foreground">
            Comment/day
          </span>
        </div>
        <ChartContainer
          config={{
            steps: {
              label: "Steps",
              color: "hsl(var(--chart-1))",
            },
          }}
          className="ml-auto w-[150px] flex-grow"
        >
          <BarChart
            accessibilityLayer
            width={150}
            height={250}
            margin={{
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
            }}
            data={[
              { date: "2024-01-01", steps: 2000 },
              { date: "2024-01-02", steps: 2100 },
              { date: "2024-01-03", steps: 2200 },
              { date: "2024-01-04", steps: 1300 },
              { date: "2024-01-05", steps: 1400 },
              { date: "2024-01-06", steps: 2500 },
              { date: "2024-01-07", steps: 1600 },
            ]}
          >
            <Bar
              dataKey="steps"
              fill="var(--color-steps)"
              radius={2}
              fillOpacity={0.2}
              activeIndex={6}
              activeBar={<Rectangle fillOpacity={0.8} />}
            />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={4}
              hide
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default BarCharts;
