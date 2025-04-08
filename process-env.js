"use strict";

const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const dotenvExpand = require("dotenv-expand");

const NODE_ENV = process.env.NODE_ENV || "dev";
const dotEnvPath = path.resolve(process.cwd(), ".env");

// https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
const dotenvFiles = [
  `${dotEnvPath}.${NODE_ENV}.local`,
  `${dotEnvPath}.${NODE_ENV}`,
  // Don't include `.env.local` for `test` environment
  // since normally you expect tests to produce the same
  // results for everyone
  NODE_ENV !== "test" && `${dotEnvPath}.local`,
  dotEnvPath
].filter(Boolean);

// Load environment variables from .env* files. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.  Variable expansion is supported in .env files.
dotenvFiles.forEach(dotenvFile => {
  if (fs.existsSync(dotenvFile)) {
    // Create the config object first
    const envConfig = dotenv.config({
      path: dotenvFile
    });
    
    // Then pass it to dotenvExpand
    dotenvExpand.expand(envConfig);
  }
});

// We support resolving modules according to `NODE_PATH`.
// This lets you use absolute paths in imports inside large monorepos:
// It works similar to `NODE_PATH` in Node itself:
// Note that unlike in Node, only *relative* paths from `NODE_PATH` are honored.
// Otherwise, we risk importing Node.js core modules into an app instead of Webpack shims.
// We also resolve them to make sure all tools using them work consistently.
const appDirectory = fs.realpathSync(process.cwd());
process.env.NODE_PATH = (process.env.NODE_PATH || "")
  .split(path.delimiter)
  .filter(folder => folder && !path.isAbsolute(folder))
  .map(folder => path.resolve(appDirectory, folder))
  .join(path.delimiter);

// Grab NODE_ENV and SPFX_* environment variables and prepare them to be
// injected into the application via DefinePlugin in Webpack configuration.
const SPFX_ = /^SPFX_/i;

function getClientEnvironment() {
  const raw = Object.keys(process.env)
    .filter(key => SPFX_.test(key))
    .reduce((env, key) => {
      env[key] = process.env[key];
      return env;
    }, {});

  // Stringify all values so we can feed into Webpack DefinePlugin
  const stringified = {
    "process.env": Object.keys(raw).reduce((env, key) => {
      env[key] = JSON.stringify(raw[key]);
      return env;
    }, {})
  };

  return { raw, stringified };
}

module.exports = getClientEnvironment;