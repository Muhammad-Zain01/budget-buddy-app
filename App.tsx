import React, { useEffect, useRef, useState } from "react";
import {
  StyleSheet,
  View,
  BackHandler,
  Platform,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from "react-native";
import { WebView, WebViewNavigation } from "react-native-webview";

const PRODUCTION_URI = "https://budget-buddy-v1.vercel.app/";
const DEBUG_URI = "http://192.168.3.108:3000";
const DEBUG_MODE = false; 

const URI = DEBUG_MODE ? DEBUG_URI : PRODUCTION_URI;

const customUserAgent = Platform.select({
  android:
    "Mozilla/5.0 (Linux; Android 10; Android SDK built for x86) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36",
  ios: "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
});

export default function App() {
  const webViewRef = useRef<WebView>(null);
  const [url, setUrl] = useState(URI);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress
    );

    return () => backHandler.remove();
  }, []);

  const handleBackPress = () => {
    if (webViewRef.current) {
      webViewRef.current.goBack();
      return true;
    }
    return false;
  };

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    if (navState.canGoBack) {
      BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
      BackHandler.addEventListener("hardwareBackPress", handleBackPress);
    } else {
      BackHandler.removeEventListener("hardwareBackPress", handleBackPress);
    }

    setUrl(navState.url);
    setIsLoading(navState.loading);
  };

  const handleError = (syntheticEvent: WebView["onError"]) => {
    const { nativeEvent } = syntheticEvent;
    setError(`${nativeEvent.description} (${nativeEvent.code})`);
    setIsLoading(false);
  };

  const handleRefresh = () => {
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const renderLoading = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );

  const renderError = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.webviewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={styles.webview}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          onNavigationStateChange={handleNavigationStateChange}
          onError={handleError}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          userAgent={customUserAgent}
          originWhitelist={["*"]}
          allowsBackForwardNavigationGestures={true}
          sharedCookiesEnabled={true}
          thirdPartyCookiesEnabled={true}
        />
        {isLoading && renderLoading()}
        {error && renderError()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  webviewContainer: {
    flex: 1,
    paddingTop: 20,
    width: "100%",
    height: "100%",
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  debugBanner: {
    backgroundColor: "red",
    padding: 5,
    width: "100%",
    alignItems: "center",
  },
  debugText: {
    color: "white",
    fontWeight: "bold",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  refreshButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  refreshButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
