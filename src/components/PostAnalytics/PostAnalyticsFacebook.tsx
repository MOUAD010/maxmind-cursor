import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getPostInsights } from "@/utils/api";
import { Loader } from "lucide-react";

interface InsightValue {
  value: number | { [key: string]: number };
}

interface InsightItem {
  name: string;
  title: string;
  description: string;
  values: InsightValue[];
}

interface PostInsightsData {
  data: InsightItem[];
}

interface PostAnalyticsFacebookProps {
  id_post: string;
  post_type?: string;
  dateRange: { startDate: string; endDate: string };
}

const PostAnalyticsFacebook: React.FC<PostAnalyticsFacebookProps> = ({
  id_post,
  post_type,
  dateRange,
}) => {
  const today = new Date();

  const { data: fbData, isLoading } = useQuery<PostInsightsData, Error>({
    queryKey: ["post", id_post],
    queryFn: () => getPostInsights(id_post),
    staleTime:
      new Date(dateRange.endDate).getMonth() === today.getMonth()
        ? 1000 * 60 * 5 // Cache for 5 minutes if the month matches
        : 10000 * 60 * 5, // Cache for a longer period otherwise
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center text-center mt-8">
        <Loader size={40} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (!fbData) {
    return <div className="text-gray-500 italic">No data available</div>;
  }

  const isVideoPost = post_type?.toLowerCase().includes("video");
  const filteredData = filterFacebookData(fbData.data, isVideoPost || false);

  const cardOrder = [
    "post_impressions",
    "post_clicks",
    "post_engaged_users",
    "post_negative_feedback",
    "post_video",
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {filteredData &&
          cardOrder.map((key) =>
            filteredData[key]
              ? renderInsightGroup(key, filteredData[key])
              : null
          )}
      </div>
    </div>
  );
};

const formatValue = (
  value: number | { [key: string]: number } | undefined
): string => {
  if (typeof value === "number") {
    return value.toLocaleString();
  } else if (typeof value === "object" && value !== null) {
    return JSON.stringify(value);
  }
  return "N/A";
};

const filterFacebookData = (
  data: InsightItem[] | undefined,
  isVideoPost: boolean
): { [key: string]: InsightItem[] } | null => {
  if (!data) return null;

  const relatedMetrics: { [key: string]: string[] } = {
    post_video: [
      "post_video_views",
      "post_video_views_organic",
      "post_video_views_paid",
      "post_video_avg_time_watched",
    ],
    post_impressions: [
      "post_impressions",
      "post_impressions_paid",
      "post_impressions_organic",
      "post_impressions_unique",
      "post_impressions_paid_unique",
      "post_impressions_organic_unique",
    ],
    post_clicks: ["post_clicks", "post_clicks_unique"],
    post_negative_feedback: [
      "post_negative_feedback",
      "post_negative_feedback_unique",
    ],
  };
  // console.log(data);
  return data.reduce<{ [key: string]: InsightItem[] }>((acc, item) => {
    if (!isVideoPost && item.name.includes("video")) {
      return acc;
    }

    const mainMetric = Object.keys(relatedMetrics).find(
      (key) => relatedMetrics[key].includes(item.name) || key === item.name
    );

    if (mainMetric) {
      acc[mainMetric] = [...(acc[mainMetric] || []), item];
    } else if (item.name !== "post_reactions_by_type_total") {
      acc[item.name] = [item];
    }

    return acc;
  }, {});
};

const simplifyTitle = (title: string): string => {
  return title
    .replace(/^Lifetime /, "")
    .replace(/^Post /, "")
    .replace(/ by type total$/, "")
    .replace(/^_ /, "")
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const renderInsightGroup = (groupName: string, items: InsightItem[]) => {
  const groupTitle = simplifyTitle(groupName);

  if (["post_impressions"].includes(groupName)) {
    return renderTableGroup(groupName, items, groupTitle);
  }

  return (
    <div
      key={groupName}
      className="bg-white border my-5 border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        {groupTitle.replace("Post", "")}
      </h3>
      {items.map((item) => (
        <div key={item.name} className="mb-4 last:mb-0">
          <div className="  items-center">
            <span className=" text-2xl text-gray-600">
              {item.name
                .replace("post_", "")
                .replace("_", " ")
                .replace("engaged users", "Total")

                .replace("clicks", "Total")
                .replace("clicks unique", "Unique")
                .replace("Total unique", "Unique")
                .replace("negative feedback", "Total")
                .replace("Total_unique", "Unique")
                .replace("video avg_time_watched", "Avg Time Watched")
                .replace("video views", "Total")
                .replace("video views organic", "Organic")
                .replace("video views paid", "Paid")
                .replace("video views unique", "Unique")
                .replace("video avg_time_watched", "Avg Time Watched")
                .replace("Total_organic", "Organic")
                .replace("Total_paid", "Paid")}
              :
            </span>
            <span className="text-right text-2xl py-2 px-2 font-medium text-blue-600">
              {item.name === "post_video_avg_time_watched"
                ? `${(Number(item.values[0].value) / 1000).toFixed(2)} sec`
                : formatValue(item.values[0].value)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

const renderTableGroup = (
  groupName: string,
  items: InsightItem[],
  groupTitle: string
) => {
  const data: { [key: string]: any } = {};
  items.forEach((item) => {
    data[item.name] = item.values[0].value;
  });

  return (
    <div
      key={groupName}
      className="bg-white border my-5 border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-800">
        {groupTitle.replace("Post", "")}
      </h3>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="text-left py-2 px-3 text-sm font-semibold">
              Metric
            </th>
            <th className="text-right py-2 px-3 text-sm font-semibold">
              Total
            </th>
            <th className="text-right py-2 px-3 text-sm font-semibold">
              Unique
            </th>
          </tr>
        </thead>
        <tbody>{renderTableRows(groupName, data)}</tbody>
      </table>
    </div>
  );
};

const renderTableRows = (groupName: string, data: any) => {
  switch (groupName) {
    case "post_impressions":
      return ["Total", "Paid", "Organic"].map((type) => (
        <tr key={type} className="border-b border-gray-100">
          <td className="py-2 px-3 text-sm text-gray-700">{type}</td>
          <td className="text-right py-2 px-3 text-sm font-medium text-blue-600">
            {formatValue(
              data[
                `post_impressions${
                  type !== "Total" ? "_" + type.toLowerCase() : ""
                }`
              ]
            )}
          </td>
          <td className="text-right py-2 px-3 text-sm font-medium text-blue-600">
            {formatValue(
              data[
                `post_impressions${
                  type !== "Total" ? "_" + type.toLowerCase() : ""
                }_unique`
              ]
            )}
          </td>
        </tr>
      ));

    case "post_clicks":
      return (
        <tr className="border-b border-gray-100">
          <td className="py-2 px-3 text-sm text-gray-700">Clicks</td>
          <td className="text-right py-2 px-3 text-sm font-medium text-blue-600">
            {formatValue(data.post_clicks)}
          </td>
          <td className="text-right py-2 px-3 text-sm font-medium text-blue-600">
            {formatValue(data.post_clicks_unique)}
          </td>
        </tr>
      );

    case "post_engaged_users":
      return (
        <tr className="border-b border-gray-100">
          <td className="py-2 px-3 text-sm text-gray-700">Engaged Users</td>
          <td className="text-right py-2 px-3 text-sm font-medium text-blue-600">
            {formatValue(data.post_engaged_users)}
          </td>
          <td className="text-right py-2 px-3 text-sm font-medium text-blue-600">
            {formatValue(data.post_engaged_users_unique)}
          </td>
        </tr>
      );

    case "post_negative_feedback":
      return (
        <tr className="border-b border-gray-100">
          <td className="py-2 px-3 text-sm text-gray-700">Negative Feedback</td>
          <td className="text-right py-2 px-3 text-sm font-medium text-blue-600">
            {formatValue(data.post_negative_feedback)}
          </td>
          <td className="text-right py-2 px-3 text-sm font-medium text-blue-600">
            {formatValue(data.post_negative_feedback_unique)}
          </td>
        </tr>
      );

    default:
      return null;
  }
};

export default PostAnalyticsFacebook;
