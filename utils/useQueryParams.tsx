import { Router, useRouter } from "next/router";
import { useCallback, useMemo, useRef } from "react";
type ParamOptionTypes =
  | "string"
  //
  | "string[]"
  | "number"
  | "number[]"
  | "boolean";

interface ParamOption<TType extends ParamOptionTypes> {
  type: TType;
  default?: inferParamType<TType>;
}

type inferParamType<
  TParamType extends ParamOptionTypes
> = TParamType extends "string"
  ? string | undefined
  : TParamType extends "string[]"
  ? string[]
  : TParamType extends "number"
  ? number | undefined
  : TParamType extends "number[]"
  ? number[]
  : TParamType extends "boolean"
  ? boolean
  : unknown;

function typecast(value: unknown, type: ParamOptionTypes) {
  if (typeof value === "undefined") {
    return undefined;
  }
  if (type.startsWith("string")) {
    return String(value);
  }
  if (type.startsWith("number")) {
    const num = Number(value);
    if (!isNaN(num)) {
      return num;
    }
  }
  if (type === "boolean" && (value === "true" || value === "false")) {
    return value === "true";
  }

  return undefined;
}

function toArray<TValue>(value: TValue) {
  return Array.isArray(value) ? value : [value];
}

type TransitionOptions = NonNullable<Parameters<Router["replace"]>[2]>;

export interface UseQueryParamsOptions {
  type?: "replace" | "push";
  transitionOptions?: TransitionOptions;
}
export function useQueryParams<
  TParams extends Record<string, ParamOptionTypes>,
  TResult extends {
    [TKey in keyof TParams]: inferParamType<TParams[TKey]>;
  },
  TSetParams extends {
    [TKey in keyof TResult]: TResult[TKey] | string;
  }
>(params: TParams, opts?: UseQueryParamsOptions) {
  const router = useRouter();
  const query = router.query;

  const result = useMemo(() => {
    const obj: Record<string, unknown> = {};
    for (const key in params) {
      const value = query[key];
      const type: ParamOptionTypes = params[key];
      if (typeof value === "undefined") {
        continue;
      }
      if (type.endsWith("[]")) {
        obj[key] = toArray(value)
          .map((v: unknown) => typecast(v, type))
          .filter((v) => typeof v !== "undefined");
      } else {
        obj[key] = typecast(value, type);
      }
    }
    return obj as TResult;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const optsRef = useRef(opts);
  optsRef.current = opts;

  const setParams = useCallback(
    (newObj: TSetParams, opts?: UseQueryParamsOptions) => {
      const q: Record<string, unknown> = {
        ...router.query,
      };
      for (const key in newObj) {
        const value = newObj[key];
        if (typeof value !== "undefined") {
          q[key] = value;
        } else {
          delete q[key];
        }
      }
      router[optsRef.current?.type ?? "push"](
        { query: q as any },
        undefined,
        optsRef.current?.transitionOptions,
      );
    },
    [router],
  );

  const setParam = useCallback(
    <TKey extends keyof TSetParams & string>(
      key: TKey,
      value: TSetParams[TKey] | undefined,
    ) => {
      setParams({
        ...(result as any),
        [key]: value,
      });
    },
    [setParams],
  );
  return { setParams, setParam, params: result };
}
