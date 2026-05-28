import js from "@eslint/js";
import globals from "globals";

export default [
  {
    ignores: ["node_modules/**", "package-lock.json"]
  },
  js.configs.recommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }],
      "no-console": "off",
      "no-empty": "warn",
      "no-constant-condition": "warn"
    }
  },
  {
    files: ["tests/**/*.js", "vitest.config.js", "scripts/**/*.mjs"],
    languageOptions: {
      sourceType: "module",
      globals: {
        ...globals.node
      }
    }
  },
  {
    files: ["share-utils.js", "data.js", "tournament-standings.js", "supabase-utils.js", "bracket-view.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        module: "readonly",
        exports: "readonly",
        require: "readonly",
        globalThis: "readonly"
      }
    }
  },
  {
    files: ["app.js", "swipe.js"],
    languageOptions: {
      globals: {
        ...globals.browser,
        BracketShare: "readonly",
        TournamentData: "readonly",
        TournamentStandings: "readonly",
        SupabaseBracket: "readonly",
        supabase: "readonly",
        BracketView: "readonly"
      }
    }
  }
];
