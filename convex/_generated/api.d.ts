/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as branches from "../branches.js";
import type * as crons from "../crons.js";
import type * as dashboard from "../dashboard.js";
import type * as reservations from "../reservations.js";
import type * as seed from "../seed.js";
import type * as sms from "../sms.js";
import type * as smsLogs from "../smsLogs.js";
import type * as users from "../users.js";
import type * as voucherExport from "../voucherExport.js";
import type * as vouchers from "../vouchers.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  branches: typeof branches;
  crons: typeof crons;
  dashboard: typeof dashboard;
  reservations: typeof reservations;
  seed: typeof seed;
  sms: typeof sms;
  smsLogs: typeof smsLogs;
  users: typeof users;
  voucherExport: typeof voucherExport;
  vouchers: typeof vouchers;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
