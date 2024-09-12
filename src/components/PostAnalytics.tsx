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
  Share2,
  MessageCircle,
  Bookmark,
  Eye,
  UserPlus,
  Activity,
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
    sad: <Frown size={20} />,
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
}: {
  id_post: string;
  platform: string;
  pageID: string;
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
  console.log(data2);
  if (isLoading || isLoading2)
    return (
      <div className="flex justify-center items-center text-center mt-8">
        <Loader size={40} className="animate-spin" />
      </div>
    );

  if (!data && !data2) return <div>No data available</div>;
  console.log(data2?.data);

  const getIcon = (name: string) => {
    switch (name) {
      case "likes":
        return <ThumbsUp size={20} />;
      case "comments":
        return <MessageCircle size={20} />;
      case "shares":
        return <Share2 size={20} />;
      case "impressions":
        return <Eye size={20} />;
      case "saved":
        return <Bookmark size={20} />;
      case "total_interactions":
        return <Activity size={20} />;
      case "follows":
        return <UserPlus size={20} />;
      case "reach":
        return <Eye size={20} />;
      default:
        return null;
    }
  };

  const renderInsightItem = (item: InsightItem) => (
    <div
      key={item.name}
      className="bg-white border border-gray-400 p-4 rounded-lg shadow-md"
    >
      <div className="flex items-center mb-2">
        {getIcon(item.name)}
        <h3 className="text-lg font-semibold ml-2">{item.title}</h3>
      </div>
      {item.name === "post_reactions_by_type_total" ? (
        <ReactionsByType
          reactions={item.values[0].value as { [key: string]: number }}
        />
      ) : (
        <p className="text-3xl font-bold text-blue-600">
          {typeof item.values[0].value === "object"
            ? JSON.stringify(item.values[0].value)
            : item.values[0].value}
        </p>
      )}
      <p className="text-sm text-gray-600 mt-2">{item.description}</p>
    </div>
  );

  return (
    <div>
      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {platform === "facebook"
          ? data?.data.map(renderInsightItem)
          : data2?.data.map(renderInsightItem)}
      </div>
    </div>
  );
};

export default PostAnalytics;
