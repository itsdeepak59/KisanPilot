import { pathToFileURL } from "node:url";

const projectUrl = pathToFileURL(`${process.cwd()}/`).href;

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) {
    const target = pathToFileURL(`${process.cwd()}/${specifier.slice(2)}.ts`).href;
    return nextResolve(target, context);
  }

  if (specifier.startsWith(".") && !specifier.endsWith(".ts") && context.parentURL?.startsWith(projectUrl) && !context.parentURL.includes("/node_modules/")) {
    return nextResolve(new URL(`${specifier}.ts`, context.parentURL).href, context);
  }

  return nextResolve(specifier, context);
}
