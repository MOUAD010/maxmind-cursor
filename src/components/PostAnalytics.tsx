import { useQuery } from "@tanstack/react-query";
import { getPostInsights } from "@/utils/api";
import { FaRegLaughSquint } from "react-icons/fa";
import {
  Loader,
  ThumbsUp,
  Heart,
  Laugh,
  Frown,
  Angry,
  Smile,
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
    wow: <FaRegLaughSquint size={20} />,
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
  plateform,
}: {
  id_post: string;
  plateform: string;
}) => {
  const { data, isLoading } = useQuery<PostInsightsData, Error>({
    queryKey: ["post", id_post],
    queryFn: () => getPostInsights(id_post),
  });

  if (isLoading)
    return (
      <div className="flex justify-center items-center text-center mt-8">
        <Loader size={40} className="animate-spin" />
      </div>
    );

  if (!data) return <div>No data available</div>;

  return (
    <div>
      {plateform === "facebook" ? (
        <div>
          <div className=" mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.data.map((item) => (
              <div
                key={item.name}
                className="bg-white border border-gray-400 p-4 rounded-lg shadow-md"
              >
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                {item.name === "post_reactions_by_type_total" ? (
                  <ReactionsByType
                    reactions={
                      item.values[0].value as { [key: string]: number }
                    }
                  />
                ) : (
                  <p className="text-3xl font-bold text-blue-600">
                    {typeof item.values[0].value === "object"
                      ? JSON.stringify(item.values[0].value)
                      : item.values[0].value}
                  </p>
                )}
                <p className="text-sm text-gray-600 mt-2">
                  {item.description.substring(9)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>Instagram analytic</div>
      )}
    </div>
  );
};

export default PostAnalytics;
