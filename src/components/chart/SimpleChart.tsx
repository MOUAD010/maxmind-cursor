import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  // CardDescription,
  CardHeader,
  // CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ThumbsUp, Heart, LaughIcon, Frown } from "lucide-react";
import { TbMoodSuprised } from "react-icons/tb";

const SimpleChart = ({ states }: { states: any }) => {
  const reactionStats = states.find(
    (stat: any) => stat.name === "post_reactions_by_type_total"
  );

  const reactions = reactionStats?.values[0]?.value || {};

  return (
    <Card className="w-full h-full">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2 [&>div]:flex-1">
        <div className="flex justify-between">
          <div className="font-bold ml-4">
            <h1>Reactions:</h1>
          </div>
          <div className="flex justify-start">
            <div className="flex justify-be gap-3 ">
              <div className="flex items-center gap-1 ">
                <ThumbsUp />
                {reactions.like || 0}
              </div>
              <div className="flex items-center gap-1">
                <Heart />
                {reactions.love || 0}
              </div>
              <div className="flex items-center gap-1">
                <LaughIcon />
                {reactions.haha || 0}
              </div>
              <div className="flex items-center gap-1">
                <Frown />
                {reactions.sorry || 0}
              </div>
              <div className="flex items-center gap-1">
                <TbMoodSuprised size={25} />
                {reactions.wow || 0}
              </div>
            </div>
          </div>
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
