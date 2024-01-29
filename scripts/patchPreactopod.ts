import { readFile, writeFile } from "fs/promises";
import { resolve } from "path";

const path = resolve(process.cwd(), "lib/preactopod");
const packagePath = resolve(path, "package.json");
const adapterPath = resolve(path, "adapter");
const readmePath = resolve(path, "README.md");

Promise.all([
  readFile(packagePath, "utf8")
    .then(JSON.parse)
    .then((packageJSON) =>
      writeFile(
        packagePath,
        JSON.stringify(patchPackageJSON(packageJSON), null, 2),
      ),
    ),

  Promise.all(
    ["index.d.mts", "index.d.ts", "index.js", "index.mjs"].map((file) => {
      const filePath = resolve(adapterPath, file);
      return readFile(filePath, "utf8").then((content) =>
        writeFile(filePath, content.replace(/react/g, "preact")),
      );
    }),
  ),

  readFile(readmePath, "utf-8").then((content) =>
    writeFile(
      readmePath,
      content.replace(/react/g, "preact").replace(/React/g, "Preact"),
    ),
  ),
]).catch((err) => {
  console.error(err);
  process.exit(1);
});

function patchPackageJSON(packageJSON: PackageJSON): PackageJSON {
  return Object.assign({}, packageJSON, {
    name: "@typesaurus/preact",
    description: packageJSON.description.replace("React", "Preact"),
    keywords: packageJSON.keywords.reduce(
      (acc, keyword) => acc.concat(keyword.replace("React", "Preact")),
      [] as string[],
    ),
    peerDependencies: Object.assign({}, packageJSON.peerDependencies, {
      preact: "*",
    }),
  });
}

interface PackageJSON {
  name: string;
  description: string;
  keywords: string[];
  peerDependencies: { [key: string]: string };
  [key: string]: any;
}
