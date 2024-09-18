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

type InstagramPageInfoProps = {
  pageId: string;
  dateRange: { startDate: string; endDate: string } | null;
};

const InstagramPageInfo: React.FC<InstagramPageInfoProps> = ({
  pageId,
  dateRange,
}) => {
  const {
    data: pageInfo,
    isLoading: pageInfoLoading,
    error: pageInfoError,
  } = useQuery({
    queryKey: ["instagramPageInfo", pageId],
    queryFn: () =>
      axios
        .post(`http://localhost:5000/api/v1/page/${pageId}/ig_data`)
        .then((res) => res.data.data),
    enabled: !!pageId,
  });

  const {
    data: instagramInsights,
    isLoading: insightsLoading,
    error: insightsError,
  } = useQuery({
    queryKey: ["instagramInsights", pageId, dateRange],
    queryFn: () =>
      axios
        .post(`http://localhost:5000/api/v1/page/${pageId}/insight`, {
          since: dateRange?.startDate,
          until: dateRange?.endDate,
        })
        .then((res) => res.data.data.data),
    enabled: !!pageId && !!dateRange,
  });

  const {
    data: demographicsData,
    isLoading: demographicsLoading,
    error: demographicsError,
  } = useQuery({
    queryKey: ["instagramDemographics", pageId],
    queryFn: async () => {
      const ageResponse = await axios.post(
        `http://localhost:5000/api/v1/page/${pageId}/IginsightsByAgeGender`,
        { breakdown: "age" }
      );
      const genderResponse = await axios.post(
        `http://localhost:5000/api/v1/page/${pageId}/IginsightsByAgeGender`,
        { breakdown: "gender" }
      );
      const cityResponse = await axios.post(
        `http://localhost:5000/api/v1/page/${pageId}/IginsightsByAgeGender`,
        { breakdown: "city" }
      );
      return {
        age: ageResponse.data,
        gender: genderResponse.data,
        city: cityResponse.data,
      };
    },
    enabled: !!pageId,
  });

  if (pageInfoLoading || insightsLoading || demographicsLoading)
    return (
      <div className="flex justify-center items-center text-center mt-8">
        <Loader size={40} className="animate-spin" />
      </div>
    );

  if (pageInfoError || insightsError || demographicsError)
    return (
      <Alert variant="destructive">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Error loading Instagram page info or insights
        </AlertDescription>
      </Alert>
    );

  if (!pageInfo || !instagramInsights || !demographicsData)
    return (
      <Alert>
        <AlertTitle>No Data</AlertTitle>
        <AlertDescription>
          No Instagram page info or insights available
        </AlertDescription>
      </Alert>
    );

  const impressionsData =
    instagramInsights?.[0]?.values.map((value: any) => ({
      date: format(new Date(value.end_time), "MMM d"),
      impressions: value.value,
    })) || [];

  const reachData =
    instagramInsights?.[1]?.values.map((value: any) => ({
      date: format(new Date(value.end_time), "MMM d"),
      reach: value.value,
    })) || [];

  // const initialImpressions = impressionsData[0]?.impressions || 0;
  // const finalImpressions =
  //   impressionsData[impressionsData.length - 1]?.impressions || 0;
  // const impressionsDifference = finalImpressions - initialImpressions;
  // const impressionsPercentage = calculatePercentageChange(
  //   initialImpressions,
  //   finalImpressions
  // );

  // const initialReach = reachData[0]?.reach || 0;
  // const finalReach = reachData[reachData.length - 1]?.reach || 0;
  // const reachDifference = finalReach - initialReach;
  // const reachPercentage = calculatePercentageChange(initialReach, finalReach);

  // Process demographics data
  const { ageData, genderData, cityData } =
    processDemographicsData(demographicsData);

  return (
    <div className="space-y-4">
      <div className="px-4 py-5 sm:px-6">
        <img
          src={pageInfo.profile_picture_url}
          alt="Profile Picture"
          className="w-24 h-24 rounded-full mb-4"
        />
        <h1 className="text-xl text-black font-semibold">
          {pageInfo.username}
        </h1>
        <div className="text-base text-gray-600 mt-2">{pageInfo.biography}</div>
        <div className="flex justify-start gap-4 text-base mt-4">
          <div className="flex items-center bg-gray-200 p-2 rounded-md">
            <Users className="w-5 h-5 mr-2" />
            <span>{pageInfo.followers_count} followers</span>
          </div>
          <div className="flex items-center bg-gray-200 p-2 rounded-md">
            <UserPlus className="w-5 h-5 mr-2" />
            <span>{pageInfo.media_count} posts</span>
          </div>
        </div>
      </div>
      <div className="mt-4 my-2">
        <center>
          <h2 className="text-lg font-semibold mb-2">Instagram Insights</h2>
        </center>
        <div className="flex flex-col md:flex-row justify-center">
          <div className="w-full md:w-1/2 p-2">
            <h3 className="text-center font-semibold">Impressions</h3>

            <ResponsiveContainer height={300} width="100%">
              <LineChart data={impressionsData}>
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
            <h3 className="text-center font-semibold">Reach</h3>

            <ResponsiveContainer height={300} width="100%">
              <LineChart data={reachData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="reach"
                  stroke="#82ca9d"
                  name="Reach"
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
          <div className="w-full lg:w-1/4 ">
            <h3 className="text-center font-semibold mb-2">Age Distribution</h3>
            <ResponsiveContainer height={200} width="100%" className="mt-2">
              <PieChart>
                <Pie
                  data={ageData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="55%"
                  outerRadius={60}
                  fill="#8884d8"
                  label
                >
                  {ageData.map((entry: any, index: number) => (
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
          <div className="w-full lg:w-1/4">
            <h3 className="text-center font-semibold mb-2">
              Gender Distribution
            </h3>
            <ResponsiveContainer height={200} width="100%" className="mt-6">
              <PieChart>
                <Pie
                  data={genderData}
                  dataKey="value"
                  nameKey="name"
                  cx="55%"
                  cy="55%"
                  outerRadius={60}
                  fill="#8884d8"
                  label
                >
                  {genderData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
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
                <YAxis dataKey="name" type="category" width={120} />
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

function processDemographicsData(data: any) {
  const ageData = data.age.data.data[0].total_value.breakdowns[0].results.map(
    (item: any) => ({
      name: item.dimension_values[0],
      value: item.value,
    })
  );

  const genderData =
    data.gender.data.data[0].total_value.breakdowns[0].results.map(
      (item: any) => ({
        name:
          item.dimension_values[0] === "M"
            ? "Male"
            : item.dimension_values[0] === "F"
            ? "Female"
            : "Unknown",
        value: item.value,
      })
    );

  const cityData = data.city.data.data[0].total_value.breakdowns[0].results
    .map((item: any) => ({
      name: item.dimension_values[0].split(", ")[0], // Only take the city name, not the region
      value: item.value,
    }))
    .sort((a: any, b: any) => b.value - a.value);

  return { ageData, genderData, cityData };
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC0CB",
];

export default InstagramPageInfo;
