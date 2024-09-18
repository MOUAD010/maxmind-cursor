import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getPostIgInsights } from "@/utils/api";
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

interface PostAnalyticsInstagramProps {
  id_post: string;
  pageID: string;
  media_type?: string;
}

const PostAnalyticsInstagram: React.FC<PostAnalyticsInstagramProps> = ({
  id_post,
  pageID,
  media_type,
}) => {
  const { data: igData, isLoading } = useQuery<PostInsightsData, Error>({
    queryKey: ["postIg", id_post, pageID],
    queryFn: () => getPostIgInsights({ id_post, pageID }),
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center text-center mt-8">
        <Loader size={40} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (!igData) {
    return <div className="text-gray-500 italic">No data available</div>;
  }

  console.log(igData.data);

  // Group insights
  const impressionsAndReach = igData.data.filter(
    (item) => item.name === "impressions" || item.name === "reach"
  );
  const followsAndProfileVisits = igData.data.filter(
    (item) => item.name === "follows" || item.name === "profile_visits"
  );
  const videoViews = igData.data.filter(
    (item) =>
      item.name === "video_views" ||
      item.name === "ig_reels_video_view_total_time" ||
      item.name === "ig_reels_video_view_avg_time" ||
      item.name === "ig_reels_aggregated_all_plays_count" ||
      item.name === "clips_replays_count"
  );

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {renderInsightGroup("Impressions & Reach", impressionsAndReach)}
        {media_type !== "VIDEO" &&
          renderInsightGroup(
            "Follows & Profile Visits",
            followsAndProfileVisits
          )}
        {media_type === "VIDEO"
          ? renderInsightGroup("Video Views", videoViews)
          : null}
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

const renderInsightGroup = (groupTitle: string, items: InsightItem[]) => {
  return (
    <div
      key={groupTitle}
      className="bg-white border mt-2 border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
    >
      <h3 className="text-lg font-semibold mb-4 text-gray-800">{groupTitle}</h3>
      {items.length === 0 && (
        <div className="text-gray-500 italic">No data available</div>
      )}
      {items.map((item) => (
        <div key={item.name} className="mb-4 last:mb-0">
          <div className="flex justify-between items-center">
            <span className="font-medium text-sm text-gray-600">
              {item.title}:
            </span>
            <span className="text-right py-2 px-3 text-sm font-medium text-blue-600">
              {formatValue(item.values[0]?.value)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostAnalyticsInstagram;
