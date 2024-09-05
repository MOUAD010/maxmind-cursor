import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from "@react-pdf/renderer";
import moment from "moment";
import { FeedItem } from "./FeedDisplay";
import no_image from "../assets/noimage.jpg";
import rubik from "../assets/Rubik-Regular.ttf";
import logo from "../assets/longbanner.png";

// Register font from local file
Font.register({
  family: "Rubik",
  src: rubik,
});

const styles = StyleSheet.create({
  page: {
    fontFamily: "Rubik",
    backgroundColor: "#ffffff",
    padding: 20,
  },
  card: {
    border: "1px solid #e0e0e0",
    borderRadius: 5,
    marginBottom: 10,
    padding: 15,
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
  },
  imageSection: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    marginBottom: 0,
  },
  image: {
    width: "30%",
    height: "80%",
    marginRight: 20,
  },
  contentSection: {
    width: "70%",
  },
  text: {
    margin: 12,
    fontSize: 14,
    textAlign: "justify",
    fontFamily: "Times-Roman",
  },
  date: {
    fontSize: 12,
    color: "#777",
    marginBottom: 5,
  },
  stats: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 5,
  },
  statItem: {
    fontSize: 10,
    marginRight: 20,
    display: "flex",
    alignItems: "center",
  },
  chartImage: {
    width: "100%",
    height: "auto",
    borderRadius: 5,
    marginTop: 10,
  },
});

type FeedPDFProps = {
  feed: FeedItem[];
  chartImages: { [key: string]: string };
};

const FeedPDF: React.FC<FeedPDFProps> = ({ feed, chartImages }) => (
  <Document>
    <Page
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <View
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Text style={{ marginBottom: 2, fontSize: 30 }}>
          Social Media Report
        </Text>
        <Text style={{ marginBottom: 15 }}>By</Text>
        <Image
          src={logo}
          style={{ width: 350, height: 200, borderRadius: 10 }}
        />
      </View>
    </Page>

    <Page style={styles.page}>
      {feed.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.imageSection}>
            <Image style={styles.image} src={item.full_picture || no_image} />
            <View style={styles.contentSection}>
              <Text style={styles.text}>
                {item.message || "This post has no caption"}
              </Text>
              <Text style={styles.date}>
                {moment(item.created_time).format("MMMM DD, YYYY")}
              </Text>
              <View style={styles.stats}>
                <View style={styles.statItem}>
                  <Text>
                    Number of reactions: {item.reactions.summary.total_count}
                  </Text>
                </View>
                <View style={styles.statItem}>
                  <Text>
                    Number of Comments: {item.comments.summary.total_count}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          {chartImages[item.id] && (
            <Image src={chartImages[item.id]} style={styles.chartImage} />
          )}
        </View>
      ))}
    </Page>

    <Page
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <View
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <Text style={{ marginBottom: 2, fontSize: 30 }}>Thank </Text>
        <Text style={{ marginBottom: 2, fontSize: 30 }}>you</Text>
      </View>
    </Page>
  </Document>
);

export default FeedPDF;
