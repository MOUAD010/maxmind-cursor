import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { ThumbsUp, MessageCircle, Forward, Loader } from "lucide-react";
import PostAnalytics from "./PostAnalytics";
// import { PDFDownloadLink } from "@react-pdf/renderer";
// import FeedPDF from "./FeedPDF";
// import { captureChart } from "../utils/pdfUtils";
import RightDrawer from "./ui/RightDrawer";
import noImage from "../assets/noimage.jpg";
import InstagramRightDrawer from "./ui/InstagramRightDrawer";
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
      `https://meta-api-eight.vercel.app/api/v1/page/${accountId}/feeds`,
      {
        limit: "100",
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

export function FeedDisplay({
  accountId,
  dateRange,
  platform,
}: FeedDisplayProps) {
  // const [chartImages, setChartImages] = useState<{ [key: string]: string }>({});
  // const [isPdfPrepared, setIsPdfPrepared] = useState(false);
  // const [isPreparing, setIsPreparing] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  // useEffect(() => {
  //   setIsPdfPrepared(false);
  // }, [accountId, dateRange]);

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

  // const prepareChartImages = useCallback(async () => {
  //   if (feedRef.current && feed) {
  //     setIsPreparing(true);
  //     const images: { [key: string]: string } = {};
  //     for (const item of feed) {
  //       const chartElement = feedRef.current.querySelector(`#chart-${item.id}`);
  //       if (chartElement) {
  //         images[item.id] = await captureChart(chartElement as HTMLElement);
  //       }
  //     }
  //     setChartImages(images);
  //     setIsPdfPrepared(true);
  //     setIsPreparing(false);
  //   }
  // }, [feed]);

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
    <div id="feed-display" className="mt-4 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold">Feed</h2>
        {feed && feed.length > 0 && (
          <>
            {/* {!isPdfPrepared ? (
              <button
                onClick={prepareChartImages}
                disabled={isPreparing}
                className={`${
                  isPreparing ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
                } text-white font-bold py-2 px-4 rounded inline-flex items-center`}
              >
                {isPreparing ? "Preparing PDF..." : "Prepare PDF"}
              </button>
            ) : (
              <PDFDownloadLink
                document={<FeedPDF feed={feed} chartImages={chartImages} />}
                fileName="feed.pdf"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
              >
                {({ loading }) => (
                  <>
                    <Download size={16} className="mr-2" />
                    {loading ? "Generating PDF..." : "Download PDF"}
                  </>
                )}
              </PDFDownloadLink>
            )} */}
          </>
        )}
      </div>
      <div className="space-y-4" ref={feedRef}>
        {feed?.map((item, index) => (
          <motion.div
            key={item.id}
            className="bg-white rounded-md shadow-sm overflow-hidden border-2 border-gray-300 p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <div className="flex flex-col sm:flex-row">
              {(item.full_picture || item.media_url) && (
                <div className="flex-shrink-0 mb-3 sm:mb-0 sm:mr-4">
                  <img
                    src={
                      item.thumbnail_url
                        ? item.thumbnail_url
                        : item.media_url || item.full_picture || noImage
                    }
                    alt=""
                    className="w-80 h-96 as object-fill rounded"
                  />
                </div>
              )}
              <div className="flex-grow">
                <div className="text-wrap break-words ">
                  <p className="text-gray-800 text-wrap mb-2 break-all">
                    {item.message || item.caption}
                  </p>
                </div>
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
                      {item?.timestamp?.substring(0, 10) ||
                        "No timestamp available"}
                    </p>
                  )}
                  {platform === "facebook" &&
                    item.reactions &&
                    item.comments && (
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <ThumbsUp size={16} className="text-blue-500 mr-1" />
                          <span className="text-sm text-gray-600">
                            {item.reactions.summary.total_count}
                          </span>
                        </div>
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
                      {item.permalink && (
                        <a
                          href={item.permalink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          View on Instagram
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {platform === "facebook" && (
              <div id={`chart-${item.id}`}>
                <PostAnalytics plateform="facebook" id_post={item.id} />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
