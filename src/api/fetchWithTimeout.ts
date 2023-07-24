export const fetchWithTimeout = async (method: string, url: string, object?: Object) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 10000);

  try {
    const request = object
      ? {
          // object の指定があれば body に JSON 形式でセットしてリクエスト
          method: method,
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json;charset=utf8",
          },
          body: JSON.stringify(object),
          signal: controller.signal,
        }
      : {
          // なければ body なしでリクエスト
          method: method,
          signal: controller.signal,
        };
    const response = await fetch(url, request);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    return response;
  } finally {
    clearTimeout(timeout);
  }
};
