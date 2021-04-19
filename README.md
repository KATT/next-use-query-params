# `useQueryParams()`


Type-safe query param handling for [Next.js](https://nextjs.org/).

- Demo at: https://next-use-query-params-katt.vercel.app/
- CodeSandbox: https://githubbox.com/KATT/next-use-query-params

## Example usage

```tsx
const { setParams, params } = useQueryParams(
  {
    str: "string",
    num: "number",
    pets: {
      type: "string[]",
    },
    bool: "boolean",
    withDefault: {
      type: "number",
      default: 42,
    },
    checky: {
      type: "string[]",
      default: ["1"],
    },
  },
);
```

### Available types

```tsx
type ParamOptionTypes =
  | "string"
  | "string[]"
  | "number"
  | "number[]"
  | "boolean";
```

### Options

```tsx
export interface UseQueryParamsOptions {
  type?: "replace" | "push";
  transitionOptions?: TransitionOptions;
}
```

**Example:**

```tsx
const { setParams, params } = useQueryParams(
  {
    // [...]
  },
  {
    type: "replace",
    transitionOptions: {
      scroll: true,
    }
  }
);
```
