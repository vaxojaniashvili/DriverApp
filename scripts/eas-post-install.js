const fs = require("fs");
const path = require("path");

console.log("Running post-install script to fix ReactCommon redefinition...");

const filePath = path.resolve(
  "./ios/Pods/Headers/Public/ReactCommon/React-RuntimeApple.modulemap"
);

try {
  let fileContent = fs.readFileSync(filePath, "utf-8");

  // Comment out the entire file to prevent ReactCommon redefinition
  const commentedContent = fileContent
    .split("\n")
    .map((line) => `// ${line}`)
    .join("\n");

  fs.writeFileSync(filePath, commentedContent, "utf-8");
  console.log("Successfully commented out React-RuntimeApple.modulemap.");
} catch (error) {
  if (error.code === "ENOENT") {
    console.log(
      "React-RuntimeApple.modulemap not found, skipping patch. This might be okay."
    );
  } else {
    console.error("Error modifying React-RuntimeApple.modulemap:", error);
  }
}
