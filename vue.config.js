module.exports = {
  chainWebpack: config => {
    config.plugin("define").tap(definitions => {
      definitions[0]["process.env"]["COMMIT_HASH"] = JSON.stringify(
        require("child_process")
          .execSync("git rev-parse HEAD")
          .toString()
          .trim()
      );
      return definitions;
    });
  },
  pwa: {
    name: "BM|Designer",
    themeColor: "#455a64",
    msTileColor: "#fafafa",
    manifestOptions: {
      background_color: "#ffffff"
    },
    workboxOptions: {
      skipWaiting: true
    }
  }
};
