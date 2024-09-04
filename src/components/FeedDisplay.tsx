import { useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { ThumbsUp, MessageCircle, Download } from "lucide-react";
import PostAnalytics from "./PostAnalytics";
import { PDFDownloadLink } from "@react-pdf/renderer";
import FeedPDF from "./FeedPDF";
import { captureChart } from "../utils/pdfUtils";

export type FeedItem = {
  id: string;
  message: string;
  created_time: string;
  full_picture?: string;
  reactions: {
    summary: {
      total_count: number;
    };
  };
  comments: {
    summary: {
      total_count: number;
    };
  };
};

type FeedDisplayProps = {
  accountId: string;
  dateRange: { startDate: string; endDate: string } | null;
};

const fetchFeed = async (accountId: string, since: string, until: string) => {
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
};

export function FeedDisplay({ accountId, dateRange }: FeedDisplayProps) {
  const [chartImages, setChartImages] = useState<{ [key: string]: string }>({});
  const [isPdfPrepared, setIsPdfPrepared] = useState(false);
  const feedRef = useRef<HTMLDivElement>(null);

  const {
    data: feed,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["feed", accountId, dateRange],
    queryFn: () =>
      fetchFeed(
        accountId,
        dateRange?.startDate || "",
        dateRange?.endDate || ""
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

  if (isLoading) {
    return <div className="text-center mt-8">Loading feed...</div>;
  }

  if (error) {
    return (
      <div className="text-center text-red-500 mt-8">
        Error loading feed. Please try again.
      </div>
    );
  }

  const prepareChartImages = async () => {
    if (feedRef.current && feed) {
      const images: { [key: string]: string } = {};
      for (const item of feed) {
        const chartElement = feedRef.current.querySelector(`#chart-${item.id}`);
        if (chartElement) {
          images[item.id] = await captureChart(chartElement as HTMLElement);
        }
      }
      setChartImages(images);
      setIsPdfPrepared(true);
    }
  };

  return (
    <div className="mt-4 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold">Feed</h2>
        {feed && feed.length > 0 && (
          <>
            {!isPdfPrepared ? (
              <button
                onClick={prepareChartImages}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
              >
                Prepare PDF
              </button>
            ) : (
              <PDFDownloadLink
                document={<FeedPDF feed={feed} chartImages={chartImages} />}
                fileName="feed.pdf"
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded inline-flex items-center"
              >
                {({ loading }) =>
                  loading ? (
                    "Loading document..."
                  ) : (
                    <>
                      <Download size={16} className="mr-2" />
                      Download PDF
                    </>
                  )
                }
              </PDFDownloadLink>
            )}
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
              {item.full_picture && (
                <div className="flex-shrink-0 mb-3 sm:mb-0 sm:mr-4">
                  <img
                    src={item.full_picture}
                    alt=""
                    className="w-full h-96 as  object-contain rounded"
                  />
                </div>
              )}
              <div className="flex-grow">
                <div className="text-wrap break-words ">
                  <p className="text-gray-800 text-wrap  mb-2 break-all">
                    {item.message}
                  </p>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                  {format(
                    new Date(item.created_time),
                    "MMM d, yyyy 'at' HH:mm"
                  )}
                </p>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center">
                    <ThumbsUp size={16} className="text-blue-500 mr-1" />
                    <span className="text-sm text-gray-600">
                      {item.reactions.summary.total_count}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <MessageCircle size={16} className="text-green-500 mr-1" />
                    <span className="text-sm text-gray-600">
                      {item.comments.summary.total_count}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div id={`chart-${item.id}`}>
              <PostAnalytics />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
