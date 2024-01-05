import { writeFile, readFile } from "fs/promises";

import { resolve } from "path";

const path = resolve(process.cwd(), "lib/reactopod");
const packagePath = resolve(path, "package.json");
const adapterPackagePath = resolve(path, "adapter/package.json");

Promise.all([
  readFile(packagePath, "utf8")
    .then(JSON.parse)
    .then((packageJSON) =>
      writeFile(
        packagePath,
        JSON.stringify(patchPackageJSON(packageJSON), null, 2)
      )
    ),

  writeFile(
    adapterPackagePath,
    JSON.stringify(
      {
        main: "./react.js",
        module: "./react.mjs",
      },
      null,
      2
    )
  ),
]).catch((err) => {
  console.error(err);
  process.exit(1);
});

function patchPackageJSON(packageJSON: PackageJSON): PackageJSON {
  return Object.assign({}, packageJSON, {
    peerDependencies: Object.assign({}, packageJSON.peerDependencies, {
      react: "*",
    }),
  });
}

interface PackageJSON {
  peerDependencies: { [key: string]: string };
  [key: string]: any;
}
