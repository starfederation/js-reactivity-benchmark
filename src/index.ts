// import { sbench } from "./benches/sBench";
import { kairoBench } from "./benches/kairoBench";
import { molBench } from "./benches/molBench";
import { promiseDelay } from "./util/asyncUtil";
import { FrameworkInfo } from "./util/frameworkTypes";
import type { PerfResultCallback } from "./util/perfLogging";

export {
  formatPerfResult,
  formatPerfResultStrings,
  PerfResult, PerfResultCallback, perfResultHeaders, PerfResultStrings
} from "./util/perfLogging";
export { ReactiveFramework } from "./util/reactiveFramework";
export { FrameworkInfo };

export async function runTests(
  frameworkInfo: FrameworkInfo[],
  logPerfResult: PerfResultCallback,
) {
  await promiseDelay(0);

  for (const { framework } of frameworkInfo) {
    await kairoBench(framework, logPerfResult);
    await promiseDelay(2000);
  }

  for (const { framework } of frameworkInfo) {
    await molBench(framework, logPerfResult);
    await promiseDelay(2000);
  }

  // Disabled because it doesn't cleanup and read computeds only outside of withBuild
  // for (const { framework } of frameworkInfo) {
  //   sbench(framework, logPerfResult);
  //   await promiseDelay(2000);
  // }

  // for (const { framework } of frameworkInfo) {
  //   await cellxbench(framework, logPerfResult);
  //   await promiseDelay(2000);
  // }

  // for (const frameworkTest of frameworkInfo) {
  //   await dynamicBench(frameworkTest, logPerfResult);
  //   await promiseDelay(2000);
  // }
}
