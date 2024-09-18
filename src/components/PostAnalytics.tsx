import React from "react";
import PostAnalyticsFacebook from "./PostAnalytics/PostAnalyticsFacebook";
import PostAnalyticsInstagram from "./PostAnalytics/PostAnalyticsInstagram";

interface PostAnalyticsProps {
  id_post: string;
  platform: "facebook" | "instagram";
  pageID: string;
  post_type?: string;
  media_type?: string;
  dateRange: { startDate: string; endDate: string };
}

const PostAnalytics: React.FC<PostAnalyticsProps> = ({
  id_post,
  platform,
  pageID,
  post_type,
  media_type,
  dateRange,
}) => {
  return platform === "facebook" ? (
    <PostAnalyticsFacebook
      id_post={id_post}
      post_type={post_type}
      dateRange={dateRange}
    />
  ) : (
    <PostAnalyticsInstagram
      id_post={id_post}
      pageID={pageID}
      media_type={media_type}
    />
  );
};

export default PostAnalytics;
