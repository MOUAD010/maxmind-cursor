import axios from "axios";

export const getPostInsights = async (id_post: string) => {
  const response = await axios.post(
    `https://meta-api-eight.vercel.app/api/v1/feed/summary/${id_post}`,
    {
      metric:
        "post_impressions,post_impressions_organic,post_impressions_paid,post_engaged_users,post_clicks,post_reactions_by_type_total,post_negative_feedback",
      period: "lifetime",
    }
  );
  return response.data.data;
};
