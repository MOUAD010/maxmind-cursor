import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { motion } from "framer-motion";
import {
  ThumbsUp,
  MessageCircle,
  Forward,
  Loader,
  Play,
  Heart,
  Laugh,
  Smile,
  Frown,
  Angry,
  Pocket,
} from "lucide-react";
import PostAnalytics from "./PostAnalytics";
import RightDrawer from "./ui/RightDrawer";
import noImage from "../assets/noimage.jpg";
import InstagramRightDrawer from "./ui/InstagramRightDrawer";
import { getPostInsights } from "@/utils/api";

export type FeedItem = {
  id: string;
  message?: string;
  caption?: string;
  created_time: string;
  full_picture?: string;
  media_url?: string;
  permalink?: string;
  timestamp?: string;
  thumbnail_url?: string;
  media_type?: string;
  insights?: any;
  shares?: {
    count: number;
  };
  reactions?: {
    summary: {
      total_count: number;
    };
  };
  comments?: {
    data: {
      timestamp: string;
      text: string;
      id: string;
    }[];
    summary?: {
      total_count: number;
    };
  };
  // Add these fields for Instagram
  like_count?: number;
  comments_count?: number;
  attachments?: {
    data: Array<{
      type: string;
      // other properties of attachment data
    }>;
  };
};

type FeedDisplayProps = {
  accountId: string;
  dateRange: { startDate: string; endDate: string } | null;
  platform: "facebook" | "instagram";
};

const fetchFeed = async (
  accountId: string,
  since: string,
  until: string,
  platform: "facebook" | "instagram"
) => {
  if (platform === "facebook") {
    const response = await axios.post(
      `http://localhost:5000/api/v1/page/${accountId}/feeds`,
      {
        limit: "5",
        offset: "0",
        since,
        until,
      }
    );
    return response.data.data.data as FeedItem[];
  } else {
    const response = await axios.post(
      `http://localhost:5000/api/v1/page/${accountId}/ig_media`
    );
    const allPosts = response.data.data.data as FeedItem[];

    // Filter Instagram posts based on the date range
    const filteredPosts = allPosts.filter((post) => {
      const postDate = new Date(post.timestamp || "");
      const sinceDate = new Date(since);
      const untilDate = new Date(until);
      return postDate >= sinceDate && postDate <= untilDate;
    });

    return filteredPosts;
  }
};

const fetchComments = async (postId: string) => {
  const response = await axios.post(
    `http://localhost:5000/api/v1/post/${postId}/comments`
  );
  return response.data.data.data;
};

const ReactionDisplay = ({ postId }: { postId: string }) => {
  const {
    data: insightsData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["postInsights", postId],
    queryFn: () => getPostInsights(postId),
  });

  if (isLoading) return <Loader size={16} className="animate-spin" />;

  if (isError || !insightsData || !insightsData.data) {
    return <div className="text-red-500">Error loading insights</div>;
  }

  const reactionData = insightsData.data.find(
    (item: any) => item.name === "post_reactions_by_type_total"
  );
  const reactions =
    (reactionData?.values[0]?.value as { [key: string]: number }) || {};

  const emoteIcons: { [key: string]: React.ReactNode } = {
    like: <ThumbsUp size={16} className="text-blue-500" />,
    love: <Heart size={16} className="text-red-500" />,
    haha: <Laugh size={16} className="text-yellow-500" />,
    wow: <Smile size={16} className="text-green-500" />,
    sorry: <Frown size={16} className="text-purple-500" />,
    angry: <Angry size={16} className="text-orange-500" />,
    care: <Smile size={16} className="text-pink-500" />,
  };

  const allReactionTypes = Object.keys(emoteIcons);

  return (
    <div className="flex items-center space-x-2">
      {allReactionTypes.map((type) => (
        <div key={type} className="flex items-center">
          <span className="mr-1">{emoteIcons[type]}</span>
          <span className="text-sm text-gray-600">{reactions[type] || 0}</span>
        </div>
      ))}
    </div>
  );
};

export function FeedDisplay({
  accountId,
  dateRange,
  platform,
}: FeedDisplayProps) {
  const feedRef = useRef<HTMLDivElement>(null);

  const {
    data: feed,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["feed", accountId, dateRange, platform],
    queryFn: () =>
      fetchFeed(
        accountId,
        dateRange?.startDate || "",
        dateRange?.endDate || "",
        platform
      ),
    enabled: !!accountId && !!dateRange,
  });

  if (!accountId || !dateRange) {
    return (
      <div className="text-center text-gray-500 mt-8 mb-4">
        Please select an account and date range to view the feed.
      </div>
    );
  }
  if (feed?.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-8 mb-4">
        No feeds found for the selected account and date range.
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="flex justify-center items-center text-center mt-8">
        <Loader size={40} className="animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-8">
        Error loading feed. Please try again.
      </div>
    );
  }

  if (!Array.isArray(feed)) {
    return (
      <div className="text-center text-red-500 mt-8 mb-4">
        This Facebook Page has no Instagram associated
      </div>
    );
  }

  return (
    <div id="feed-display" className="mt-4 max-w-5xl mx-auto ">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold">Feed</h2>
      </div>
      <div className="space-y-4" ref={feedRef}>
        {feed?.map((item: FeedItem, index: number) => (
          <motion.div
            key={item.id}
            className="bg-white rounded-md shadow-sm overflow-hidden border-2 border-gray-300 p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <div className="flex flex-col sm:flex-row">
              {(item.full_picture || item.media_url || item.thumbnail_url) && (
                <div className="flex-shrink-0 mb-3 sm:mb-0 sm:mr-4 relative">
                  <img
                    src={
                      item.thumbnail_url
                        ? item.thumbnail_url
                        : item.media_url || item.full_picture || noImage
                    }
                    alt=""
                    className="w-80 h-96 object-fill rounded"
                  />
                  {(item.attachments?.data[0].type
                    ?.toLowerCase()
                    .includes("video") ||
                    item.media_type === "VIDEO") && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play
                        size={48}
                        className="text-black bg-white/50 rounded-full p-2"
                      />
                    </div>
                  )}
                </div>
              )}

              <div className="flex-grow">
                <div className="text-wrap break-words h-[350px] ">
                  <p className="text-gray-800 text-wrap mb-2 break-all">
                    {(item.message || item.caption || "No caption available")
                      .split("#")
                      .map((part, index) =>
                        index === 0 ? (
                          <>
                            {part}
                            {index <
                              (
                                item.message ||
                                item.caption ||
                                "No caption available"
                              ).split("#").length -
                                1 && (
                              <>
                                <br />
                              </>
                            )}
                          </>
                        ) : (
                          <>#{part}</>
                        )
                      )}
                  </p>
                </div>
                <div></div>
                <div className="flex justify-between">
                  {platform === "facebook" ? (
                    <p className="text-sm text-gray-600 mb-1">
                      {format(
                        new Date(item.created_time),
                        "MMM d, yyyy 'at' HH:mm"
                      )}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600 mb-1">
                      {format(
                        new Date(item?.timestamp?.substring(0, 10) || ""),
                        "MMM d, yyyy"
                      )}
                    </p>
                  )}
                  {platform === "facebook" &&
                    item.reactions &&
                    item.comments && (
                      <div className="flex items-center space-x-3">
                        <ReactionDisplay postId={item.id} />
                        <div className="flex items-center">
                          <Forward size={16} className="text-yellow-500 mr-1" />
                          <span className="text-sm text-gray-600">
                            {item.shares?.count || 0}
                          </span>
                        </div>
                        {item.comments?.summary?.total_count &&
                        item.comments?.summary?.total_count > 0 ? (
                          <div className="text-sm text-red-600">
                            <RightDrawer
                              date={item.created_time}
                              text={item.message || ""}
                              postId={item.id}
                              fetchComments={fetchComments}
                            >
                              <div className="flex items-center">
                                <MessageCircle
                                  size={16}
                                  className="text-green-500 mr-1"
                                />
                                <span className="text-sm text-gray-600">
                                  {item.comments?.summary?.total_count || 0}
                                </span>
                              </div>
                            </RightDrawer>
                          </div>
                        ) : (
                          <div className="text-sm text-red-600">
                            <div className="flex items-center">
                              <MessageCircle
                                size={16}
                                className="text-green-500 mr-1"
                              />
                              <span className="text-sm text-gray-600">
                                {item.comments?.summary?.total_count || 0}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  {platform === "instagram" && (
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center">
                        <ThumbsUp size={16} className="text-blue-500 mr-1" />
                        <span className="text-sm text-gray-600">
                          {item.like_count || 0}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Forward size={16} className="text-yellow-500 mr-1" />
                        <span className="text-sm text-gray-600">
                          {item.insights.data[0].values[0].value || 0}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Pocket size={16} className="text-red-500 mr-1" />
                        <span className="text-sm text-gray-600">
                          {item.insights.data[1].values[0].value || 0}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {item.comments_count && item.comments_count > 0 ? (
                          <div>
                            {" "}
                            <InstagramRightDrawer
                              comments={item.comments?.data || []}
                            >
                              <button className="flex items-center">
                                <MessageCircle
                                  size={16}
                                  className="text-green-500 mr-1"
                                />
                                <span className="text-sm text-gray-600">
                                  {item.comments_count || 0}
                                </span>
                              </button>
                            </InstagramRightDrawer>
                          </div>
                        ) : (
                          <div>
                            {" "}
                            <button className="flex items-center">
                              <MessageCircle
                                size={16}
                                className="text-green-500 mr-1"
                              />
                              <span className="text-sm text-gray-600">
                                {item.comments_count || 0}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div id={`chart-${item.id}`}>
              <PostAnalytics
                platform={platform}
                id_post={item.id}
                pageID={accountId}
                dateRange={dateRange}
                post_type={item.attachments?.data[0].type}
                media_type={
                  platform === "instagram" ? item.media_type : undefined
                }
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
