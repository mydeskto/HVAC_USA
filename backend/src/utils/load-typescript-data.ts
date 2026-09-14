import { readFile } from "node:fs/promises";
import vm from "node:vm";
import ts from "typescript";

function mockRequire(specifier: string): unknown {
  if (specifier.startsWith("@/public/")) {
    const publicPath = `/${specifier.slice("@/public/".length).replaceAll("\\", "/")}`;
    return { __esModule: true, default: { src: publicPath } };
  }

  throw new Error(`Unsupported import while loading frontend data: ${specifier}`);
}

export async function loadTypescriptExport<T>(filePath: string, exportName: string): Promise<T> {
  const source = await readFile(filePath, "utf8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.CommonJS,
      esModuleInterop: true,
    },
    fileName: filePath,
  }).outputText;

  const module = { exports: {} as Record<string, unknown> };
  const context = vm.createContext({
    module,
    exports: module.exports,
    require: mockRequire,
    console,
  });
  new vm.Script(compiled, { filename: filePath }).runInContext(context);

  if (!(exportName in module.exports)) {
    throw new Error(`Export ${exportName} was not found in ${filePath}`);
  }

  return module.exports[exportName] as T;
}
