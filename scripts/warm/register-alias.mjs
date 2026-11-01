import { register } from "node:module";
import { pathToFileURL } from "node:url";

register("./scripts/warm/alias-loader.mjs", pathToFileURL("./"));
