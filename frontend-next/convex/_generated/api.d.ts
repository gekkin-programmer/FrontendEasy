/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as SocialActions from "../SocialActions.js";
import type * as accounts from "../accounts.js";
import type * as analytics from "../analytics.js";
import type * as analyticsActions from "../analyticsActions.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as meta from "../meta.js";
import type * as posts from "../posts.js";
import type * as publish from "../publish.js";
import type * as users from "../users.js";
import type * as workspaces from "../workspaces.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  SocialActions: typeof SocialActions;
  accounts: typeof accounts;
  analytics: typeof analytics;
  analyticsActions: typeof analyticsActions;
  crons: typeof crons;
  http: typeof http;
  meta: typeof meta;
  posts: typeof posts;
  publish: typeof publish;
  users: typeof users;
  workspaces: typeof workspaces;
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
