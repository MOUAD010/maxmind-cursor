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
} from "recharts";
import { format } from "date-fns";

type PageInfoProps = {
  pageId: string;
  dateRange: { startDate: string; endDate: string } | null;
  platform: "facebook" | "instagram";
};

const PageInfo: React.FC<PageInfoProps> = ({ pageId, dateRange, platform }) => {
  const {
    data: pageInfo,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["pageInfo", pageId, platform],
    queryFn: () =>
      platform === "facebook"
        ? axios
            .get(`https://meta-api-eight.vercel.app/api/v1/page/${pageId}`)
            .then((res) => res.data.data)
        : axios
            .post(`http://localhost:5000/api/v1/page/${pageId}/ig_data`)
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
    enabled: !!pageId && !!dateRange && platform === "instagram",
  });

  if (isLoading || pageLikesLoading || insightsLoading)
    return (
      <div className="flex justify-center items-center text-center mt-8">
        <Loader size={40} className="animate-spin" />
      </div>
    );

  if (error || pageLikesError || insightsError)
    return <div>Error loading page info</div>;

  if (
    !pageInfo ||
    (!pageLikesData && platform === "facebook") ||
    (!instagramInsights && platform === "instagram")
  )
    return <div>No page info available</div>;

  if (platform === "instagram") {
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

    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <img
            src={pageInfo.profile_picture_url}
            alt="Profile Picture"
            className="w-24 h-24 rounded-full mb-4"
          />
          <h1 className="text-xl text-black font-semibold">
            {pageInfo.username}
          </h1>
          <div className="text-base text-gray-600 mt-2">
            {pageInfo.biography}
          </div>
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
      </div>
    );
  }

  const chartData =
    pageLikesData?.data[0]?.values.map((value: any, index: number) => ({
      date: format(new Date(value.end_time), "MMM d"),
      impressions: value.value,
      fans: pageLikesData?.data[1]?.values[index]?.value || 0,
    })) || [];
  // {<---//facebook\\--->}
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
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
              <span>{pageInfo.fan_count} fans</span>
            </div>
            <div className="flex items-center bg-gray-200 p-2 rounded-md">
              <UserPlus className="w-5 h-5 mr-2" />
              <span>{pageInfo.followers_count} followers</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-4 my-2">
        <center>
          <h2 className="text-lg font-semibold mb-2">
            Page Growth for
            <span className="px-2">
              {format(
                new Date(dateRange?.startDate ?? new Date()),
                "MMM d, yyyy "
              )}
            </span>
            -
            <span className="px-2">
              {format(
                new Date(dateRange?.endDate ?? new Date()),
                "MMM d, yyyy "
              )}
            </span>
          </h2>
        </center>
        <div className="flex flex-col md:flex-row justify-center px-6">
          <div className="w-full md:w-1/2 p-2 ">
            <h3 className="text-center font-semibold">Page Impressions</h3>
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
            <h3 className="text-center font-semibold">Page Fans</h3>
            <ResponsiveContainer height={300} width="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
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
    </div>
  );
};

export default PageInfo;
