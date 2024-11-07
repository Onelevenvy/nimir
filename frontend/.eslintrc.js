module.exports = {
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "unused-imports", "react", "react-hooks", "import"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "next/core-web-vitals",
    "prettier"
  ],
  rules: {
    // 基本规则
    // "no-console": ["warn", { allow: ["warn", "error"] }],
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "unused-imports/no-unused-imports": "error",
    "unused-imports/no-unused-vars": "off", // 禁用未使用变量的警告

    // React 相关规则
    "react/prop-types": "off",
    "react/react-in-jsx-scope": "off",
    "react/jsx-filename-extension": ["warn", { "extensions": [".tsx"] }],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // 移除或放宽导入顺序规则
    "import/order": "off",
    "import/newline-after-import": "off",
    "import/no-unresolved": "off", // 禁用无法解析模块路径的规则
    "import/no-named-as-default-member": "off", // 禁用这个规则

    // TypeScript 特定规则
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-non-null-assertion": "off", // 禁用非空断言规则
    "@typescript-eslint/no-require-imports": "off", // 禁用 require() 导入规则
    "@typescript-eslint/no-unused-expressions": "off",
    "@typescript-eslint/no-non-null-asserted-optional-chain":"off",
    // 其他常用规则
    "no-use-before-define": "off",
    "@typescript-eslint/no-use-before-define": ["off"],
    "no-prototype-builtins": "off", // 禁用 no-prototype-builtins 规则

    // 移除 padding-line-between-statements 规则
    "padding-line-between-statements": "off",

    // 新增规则
    "import/default": "off",
    "import/no-named-as-default": "off",

    // 禁用 case 块中的词法声明规则
    "no-case-declarations": "off",
    
    // 禁用图片必须有 alt 属性的规则
    "jsx-a11y/alt-text": "off",

    // 添加以下规则来禁用变量声明和使用顺序的检查
    // "@typescript-eslint/no-use-before-define": "off",
    // "no-use-before-define": "off",

    // 禁用块级作用域变量重复声明的检查
    "no-shadow": "off",
    "@typescript-eslint/no-shadow": "off",

    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-empty-object-type": "off",
  },
  settings: {
    "react": {
      "version": "detect"
    },
    "import/resolver": {
      "typescript": {},
      "node": {
        "extensions": [".js", ".jsx", ".ts", ".tsx"]
      }
    }
  }
};
