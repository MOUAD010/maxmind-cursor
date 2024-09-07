import React from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Users, UserPlus } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
type PageInfoProps = {
  pageId: string;
  dateRange: { startDate: string; endDate: string } | null;
};

const PageInfo: React.FC<PageInfoProps> = ({ pageId, dateRange }) => {
  const {
    data: pageInfo,
    isLoading,
    error,
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
            metric: "page_fan_adds",
            since: dateRange?.startDate,
            until: dateRange?.endDate,
          }
        )
        .then((res) => res.data.data),
    enabled: !!pageId,
  });

  if (isLoading || pageLikesLoading) return <div>Loading page info...</div>;
  if (error || pageLikesError) return <div>Error loading page info</div>;
  if (!pageInfo || !pageLikesData) return <div>No page info available</div>;

  //   console.log(pageLikesData.data[0].values);
  const chartData = pageLikesData.data[0].values.map((value: any) => ({
    date: value.date,
    value: value.value,
  }));
  //   console.log(chartData);

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="space-y-4">
        {pageInfo.cover?.source && (
          <img
            src={pageInfo.cover.source}
            alt="Page Cover"
            className="w-full h-64 object-fit rounded-t-lg"
          />
        )}
        <div className="px-4 py-5 sm:px-6">
          <h1 className="text-xl text-black font-semibold">{pageInfo.name}</h1>
          <div className="text-base text-gray-600 mt-2">{pageInfo.about}</div>
          <div className="flex justify-between text-base mt-4">
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
            Page Fans Growth for {dateRange?.startDate} - {dateRange?.endDate}
          </h2>
        </center>
        <div className="flex justify-center">
          <ResponsiveContainer height={350} width="90%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PageInfo;
