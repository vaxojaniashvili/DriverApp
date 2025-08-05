import Constants from "expo-constants";

console.log("🔍 Constants object:", Constants);
console.log("🔍 Constants.expoConfig:", Constants?.expoConfig);
console.log("🔍 Constants.easConfig:", Constants?.easConfig);
console.log("🔍 Constants.manifest:", Constants?.manifest);

console.log("🔍 Project ID sources:");
console.log(
  "- expoConfig.extra.eas.projectId:",
  Constants?.expoConfig?.extra?.eas?.projectId
);
console.log("- easConfig.projectId:", Constants?.easConfig?.projectId);
console.log(
  "- manifest.extra.eas.projectId:",
  Constants?.manifest?.extra?.eas?.projectId
);

export default Constants;
