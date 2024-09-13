import { useQuery } from "@tanstack/react-query";
import { getPostInsights, getPostIgInsights } from "@/utils/api";
import {
  Loader,
  ThumbsUp,
  Heart,
  Laugh,
  Frown,
  Angry,
  Smile,
  // Share2,
  // MessageCircle,
  // Bookmark,
  // Eye,
  // UserPlus,
  // Activity,
} from "lucide-react";

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

const ReactionsByType = ({
  reactions,
}: {
  reactions: { [key: string]: number };
}) => {
  const emoteIcons: { [key: string]: React.ReactNode } = {
    like: <ThumbsUp size={20} />,
    love: <Heart size={20} />,
    haha: <Laugh size={20} />,
    wow: <Smile size={20} />,
    sorry: <Frown size={20} />,
    angry: <Angry size={20} />,
    care: <Smile size={20} />,
  };

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(reactions).map(([type, count]) => (
        <div key={type} className="flex items-center">
          <span className="mr-1">{emoteIcons[type] || type}</span>
          <span className="font-bold">{count}</span>
        </div>
      ))}
    </div>
  );
};

const PostAnalytics = ({
  id_post,
  platform,
  pageID,
  post_type,
}: {
  id_post: string;
  platform: string;
  pageID: string;
  post_type?: string;
}) => {
  const { data, isLoading } = useQuery<PostInsightsData, Error>({
    queryKey: ["post", id_post],
    queryFn: () => getPostInsights(id_post),
    enabled: platform === "facebook",
  });

  const { data: data2, isLoading: isLoading2 } = useQuery<
    PostInsightsData,
    Error
  >({
    queryKey: ["postIg", id_post, pageID],
    queryFn: () => getPostIgInsights({ id_post, pageID }),
    enabled: platform === "instagram",
  });
  // console.log(data);
  if (isLoading || isLoading2)
    return (
      <div className="flex justify-center items-center text-center mt-8">
        <Loader size={40} className="animate-spin" />
      </div>
    );

  if (!data && !data2) return <div>No data available</div>;
  // console.log(data2?.data);

  // const getIcon = (name: string) => {
  //   switch (name) {
  //     case "likes":
  //       return <ThumbsUp size={20} />;
  //     case "comments":
  //       return <MessageCircle size={20} />;
  //     case "shares":
  //       return <Share2 size={20} />;
  //     case "impressions":
  //       return <Eye size={20} />;
  //     case "saved":
  //       return <Bookmark size={20} />;
  //     case "total_interactions":
  //       return <Activity size={20} />;
  //     case "follows":
  //       return <UserPlus size={20} />;
  //     case "reach":
  //       return <Eye size={20} />;
  //     default:
  //       return null;
  //   }
  // };
  // console.log(data);
  const isVideoPost = post_type?.toLowerCase().includes("video");

  const filteredData = data?.data.reduce((acc: any, item) => {
    const relatedMetrics: { [key: string]: string[] } = {
      post_video: [
        "post_video_views",
        "post_video_views_organic",
        "post_video_views_paid",
        "post_video_avg_time_watched",
      ],
      post_impressions: ["post_impressions_paid", "post_impressions_organic"],
      post_impressions_unique: [
        "post_impressions_paid_unique",
        "post_impressions_organic_unique",
      ],
    };

    // Skip video-related metrics for non-video posts
    if (!isVideoPost && item.name.includes("video")) {
      return acc;
    }

    // Check if the current metric has related child metrics
    const mainMetric = Object.keys(relatedMetrics).find(
      (key) => relatedMetrics[key].includes(item.name) || key === item.name
    );

    // If it's a main metric or related to a main metric
    if (mainMetric) {
      // If the group doesn't exist, create it
      if (!acc[mainMetric]) {
        acc[mainMetric] = [];
      }

      // Add the metric to the group
      acc[mainMetric].push(item);
    } else {
      // If the metric doesn't belong to any related group, add it normally
      if (!acc[item.name]) {
        acc[item.name] = [];
      }
      acc[item.name].push(item);
    }

    return acc;
  }, {});

  // Example output log
  // console.log(data);
  console.log(filteredData);

  const renderInsightGroup = (groupName: string, items: InsightItem[]) => (
    <div
      key={groupName}
      className="bg-white border border-gray-400 p-4 rounded-lg shadow-md"
    >
      <h3 className="text-lg font-semibold mb-4">
        {groupName
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")}
      </h3>
      {items.map((item) => (
        <div key={item.name} className="mb-4 last:mb-0">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-sm">
              {item.title.replace("Lifetime ", "")}:
            </span>
            <span className="font-bold text-blue-600">
              {item.name === "post_video_avg_time_watched"
                ? `${(Number(item.values[0].value) / 60000).toFixed(2)} min`
                : typeof item.values[0].value === "object"
                ? JSON.stringify(item.values[0].value)
                : item.values[0].value}
            </span>
          </div>
          {/* <p className="text-sm text-gray-600 mt-1">{item.description}</p> */}
        </div>
      ))}
    </div>
  );

  const renderReactions = (item: InsightItem) => (
    <div
      key={item.name}
      className="bg-white border border-gray-400 p-4 rounded-lg shadow-md"
    >
      <h3 className="text-lg font-semibold mb-4">{item.title}</h3>
      <ReactionsByType
        reactions={item.values[0].value as { [key: string]: number }}
      />
      <p className="text-sm text-gray-600 mt-2">{item.description}</p>
    </div>
  );

  return (
    <div>
      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* <h1>{post_type}</h1> */}
        {platform === "facebook" && filteredData
          ? Object.entries(filteredData).map(([key, items]: any) =>
              key === "post_reactions_by_type_total"
                ? renderReactions(items[0] as InsightItem)
                : renderInsightGroup(key, items as InsightItem[])
            )
          : data2?.data.map((item) => renderInsightGroup(item.name, [item]))}
      </div>
    </div>
  );
};

export default PostAnalytics;
