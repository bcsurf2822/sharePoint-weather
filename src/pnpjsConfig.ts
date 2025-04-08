import { WebPartContext } from "@microsoft/sp-webpart-base";
import { SPFI, SPFx, spfi } from "@pnp/sp";
import { PnPLogging, LogLevel } from "@pnp/logging";

import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/batching";

let _sp: SPFI | undefined = undefined;

export const getSP = (context?: WebPartContext): SPFI => {
  if (_sp === undefined && context) {
    // Initialize the SP instance only if undefined and context is available
    _sp = spfi().using(SPFx(context)).using(PnPLogging(LogLevel.Warning));
  } else if (!_sp) {
    throw new Error("Context not available and SP not initialized");
  }
  return _sp;
};
