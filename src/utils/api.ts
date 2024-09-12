import axios from "axios";

export const getPostInsights = async (id_post: string) => {
  const response = await axios.post(
    `https://meta-api-eight.vercel.app/api/v1/feed/summary/${id_post}`,
    {
      metric:
        "post_engaged_users,post_video_views,post_video_views_organic,post_video_views_paid,post_negative_feedback,post_negative_feedback_unique,post_impressions,post_impressions_unique,post_impressions_paid,post_impressions_paid_unique,post_impressions_organic,post_impressions_organic_unique,post_reactions_like_total,post_reactions_love_total,post_reactions_wow_total,post_reactions_haha_total,post_reactions_sorry_total,post_reactions_anger_total,post_clicks,post_clicks_unique,post_reactions_by_type_total",
      period: "lifetime",
    }
  );
  return response.data.data;
};
export const getPostIgInsights = async ({
  id_post,
  pageID,
}: {
  id_post: string;
  pageID: string;
}) => {
  const response = await axios.post(
    `http://localhost:5000/api/v1/post_ig/${pageID}/${id_post}/insights`
  );
  return response.data.data;
};
