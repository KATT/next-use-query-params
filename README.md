# `useQueryParams()`


Type-safe query param handling for [Next.js](https://nextjs.org/).


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
  {
    type: "push",
    transitionOptions: {
      scroll: false,
    },
  },
);
```

