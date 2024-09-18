import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Users, UserPlus, Loader } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { format } from "date-fns";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type FacebookPageInfoProps = {
  pageId: string;
  dateRange: { startDate: string; endDate: string } | null;
};

const FacebookPageInfo: React.FC<FacebookPageInfoProps> = ({
  pageId,
  dateRange,
}) => {
  const {
    data: pageInfo,
    isLoading: pageInfoLoading,
    error: pageInfoError,
  } = useQuery({
    queryKey: ["pageInfo", pageId],
    queryFn: () =>
      axios
        .get(`https://meta-api-eight.vercel.app/api/v1/page/${pageId}`)
        .then((res) => res.data.data),
    enabled: !!pageId,
  });

  const {
    data: pageLikesData,
    isLoading: pageLikesLoading,
    error: pageLikesError,
  } = useQuery({
    queryKey: ["pageLikes", pageId, dateRange],
    queryFn: () =>
      axios
        .post(
          `https://meta-api-eight.vercel.app/api/v1/page/summary/${pageId}`,
          {
            metric: "page_impressions,page_fans",
            period: "day",
            since: dateRange?.startDate,
            until: dateRange?.endDate,
          }
        )
        .then((res) => res.data.data),
    enabled: !!pageId && !!dateRange,
  });

  const {
    data: ageGenderData,
    isLoading: ageGenderLoading,
    error: ageGenderError,
  } = useQuery({
    queryKey: ["ageGenderInsights", pageId, dateRange],
    queryFn: () =>
      axios
        .post(
          `http://localhost:5000/api/v1/page/${pageId}/insightsByAgeGender`,
          {
            since: dateRange?.startDate,
            until: dateRange?.endDate,
          }
        )
        .then((res) => res.data.data),
    enabled: !!pageId && !!dateRange,
  });
  // console.log(ageGenderData);
  if (pageInfoLoading || pageLikesLoading || ageGenderLoading)
    return (
      <div className="flex justify-center items-center text-center mt-8">
        <Loader size={40} className="animate-spin" />
      </div>
    );

  if (pageInfoError || pageLikesError || ageGenderError)
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Error loading page info or insights</AlertDescription>
      </Alert>
    );

  if (!pageInfo || !pageLikesData || !ageGenderData)
    return (
      <Alert>
        <AlertTitle>No Data</AlertTitle>
        <AlertDescription>No page info or insights available</AlertDescription>
      </Alert>
    );

  // Process age and gender data
  const { ageData, genderData } = processInsightsByAgeAndGender(
    ageGenderData.data.find(
      (item: { name: string }) =>
        item.name === "page_impressions_by_age_gender_unique"
    )
  );
  console.log(ageData);
  // Process city data
  const cityData = processCityData(
    ageGenderData.data.find(
      (item: { name: string }) => item.name === "page_fans_city"
    )
  );

  const pieChartData = Object.entries(ageData).map(([age, value]) => ({
    name: age,
    value: value as number,
  }));

  const genderPieData = Object.entries(genderData).map(([gender, value]) => ({
    name: gender === "M" ? "Male" : gender === "F" ? "Female" : "Unknown",
    value: value as number,
  }));

  const chartData =
    pageLikesData?.data[0]?.values.map((value: any, index: number) => ({
      date: format(new Date(value.end_time), "MMM d"),
      impressions: value.value,
      fans: pageLikesData?.data[1]?.values[index]?.value || 0,
    })) || [];

  // Calculate the minimum and maximum fan values
  const minFans = Math.min(
    ...chartData.map((item: { fans: number }) => item.fans)
  );
  const maxFans = Math.max(
    ...chartData.map((item: { fans: number }) => item.fans)
  );

  // Calculate a suitable y-axis domain for fans
  const fansYAxisDomain = [
    Math.floor(minFans * 0.9999), // Slightly lower than the minimum
    Math.ceil(maxFans * 1.0001), // Slightly higher than the maximum
  ];

  // const initialImpressions = chartData[0]?.impressions || 0;
  // const finalImpressions = chartData[chartData.length - 1]?.impressions || 0;
  // const impressionsDifference = finalImpressions - initialImpressions;
  // const impressionsPercentage = calculatePercentageChange(
  //   initialImpressions,
  //   finalImpressions
  // );

  // const initialFans = chartData[0]?.fans || 0;
  // const finalFans = chartData[chartData.length - 1]?.fans || 0;
  // const fansDifference = finalFans - initialFans;
  // const fansPercentage = calculatePercentageChange(initialFans, finalFans);

  return (
    <div className="space-y-4">
      {pageInfo.cover?.source && (
        <img
          src={pageInfo.cover.source}
          alt="Page Cover"
          className="w-full h-64 object-fill rounded-t-lg"
        />
      )}
      <div className="px-4 py-5 sm:px-6">
        <h1 className="text-xl text-black font-semibold">{pageInfo.name}</h1>
        <div className="text-base text-gray-600 mt-2">{pageInfo.about}</div>
        <div className="flex justify-start gap-4 text-base mt-4">
          <div className="flex items-center bg-gray-200 p-2 rounded-md">
            <Users className="w-5 h-5 mr-2" />
            <span>{pageInfo.fan_count} likes</span>
          </div>
          <div className="flex items-center bg-gray-200 p-2 rounded-md">
            <UserPlus className="w-5 h-5 mr-2" />
            <span>{pageInfo.followers_count} followers</span>
          </div>
        </div>
      </div>
      <div className="mt-4 my-2">
        <center>
          <h2 className="text-lg font-semibold mb-2">
            Facebook Insights{" "}
            {format(new Date(dateRange?.startDate || ""), "MMM d")} -
            {format(new Date(dateRange?.endDate || ""), "MMM d")}
          </h2>
        </center>
        <div className="flex flex-col md:flex-row justify-center">
          <div className="w-full md:w-1/2 p-2">
            <h3 className="text-center font-semibold">Impressions</h3>
            {/* <p
              className={`text-center mt-2 ${
                impressionsDifference >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {impressionsDifference >= 0 ? "+" : ""}
              {impressionsDifference} impressions (
              {impressionsPercentage.toFixed(2)}%)
            </p> */}
            <ResponsiveContainer height={300} width="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="impressions"
                  stroke="#8884d8"
                  name="Impressions"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full md:w-1/2 p-2">
            <h3 className="text-center font-semibold">Fans</h3>
            {/* <p
              className={`text-center mt-2 ${
                fansDifference >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {fansDifference >= 0 ? "+" : ""}
              {fansDifference} fans ({fansPercentage.toFixed(2)}%)
            </p> */}
            <ResponsiveContainer height={300} width="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={fansYAxisDomain} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="fans"
                  stroke="#82ca9d"
                  name="Fans"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-8 my-2">
        <center>
          <h2 className="text-lg font-semibold mb-4">
            Audience Demographics and Top Cities
          </h2>
        </center>
        <div className="flex flex-col lg:flex-row justify-center gap-1">
          {Object.values(ageData).some((value) => value > 0) && (
            <div className="w-full lg:w-1/4">
              <h3 className="text-center font-semibold mb-2">
                Age Distribution
              </h3>
              <ResponsiveContainer height={200} width="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    label
                  >
                    {pieChartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    layout="vertical"
                    align="left"
                    verticalAlign="middle"
                    iconSize={10}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {Object.values(genderData).some((value) => value > 0) && (
            <div className="w-full lg:w-1/4">
              <h3 className="text-center font-semibold mb-2">
                Gender Distribution
              </h3>
              <ResponsiveContainer height={200} width="100%">
                <PieChart>
                  <Pie
                    data={genderPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="55%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    label
                  >
                    {genderPieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                  // layout="vertical"
                  // align="bottom"
                  // verticalAlign="middle"
                  // wrapperStyle={{
                  //   paddingLeft: "50px", // Adjust this value to move the legend more to the right
                  // }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          <div className="w-full lg:w-[55%]">
            <h3 className="text-center font-semibold mb-2">Top Cities</h3>
            <ResponsiveContainer height={400} width="100%">
              <BarChart
                layout="vertical"
                data={cityData.slice(0, 10)}
                margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="city" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// Function to process the Facebook Insights data and aggregate by age and gender
function processInsightsByAgeAndGender(data: any) {
  if (!data || !data.values || data.values.length === 0) {
    return { ageData: {}, genderData: {} };
  }

  const ageGroups = [
    "13-17",
    "18-24",
    "25-34",
    "35-44",
    "45-54",
    "55-64",
    "65+",
  ];
  const ageResult: { [key: string]: number } = {};
  const genderResult: { [key: string]: number } = { M: 0, F: 0, U: 0 };

  // Initialize age result object
  ageGroups.forEach((group) => {
    ageResult[group] = 0;
  });

  const values = data.values[0].value; // Get the most recent data point

  Object.entries(values).forEach(([key, value]) => {
    const [gender, age] = key.split(".");
    if (ageGroups.includes(age)) {
      ageResult[age] += value as number;
      genderResult[gender] += value as number;
    }
  });

  return { ageData: ageResult, genderData: genderResult };
}

// Function to process city data
function processCityData(data: any) {
  if (!data || !data.values || data.values.length === 0) return [];

  const cityData = data.values[data.values.length - 1].value; // Get the most recent data point

  return Object.entries(cityData)
    .map(([city, value]) => ({
      city: city
        .replace(/\s*[,،]?\s*Morocco$|\s*[,،]?\s*Maroc$|\s*[,،]?\s*المغرب$/, "") // Remove Morocco/Maroc/المغرب with any type of comma or space
        .replace(/،\s*$/, "") // Remove Arabic comma at the end
        .trim(), // Trim any remaining whitespace
      value: value as number,
    }))
    .sort((a, b) => b.value - a.value); // Sort by value in descending order
}

// Colors for the charts
const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC0CB",
];

export default FacebookPageInfo;
