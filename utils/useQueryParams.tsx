import { Router, useRouter } from "next/router";
import { useCallback, useMemo, useRef } from "react";
type ParamOptionTypes =
  | "string"
  //
  | "string[]"
  | "number"
  | "number[]"
  | "boolean";

interface ParamOptionInterface<TType extends ParamOptionTypes> {
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

type ParamOptionType =
  | ParamOptionInterface<"boolean">
  | ParamOptionInterface<"number">
  | ParamOptionInterface<"number[]">
  | ParamOptionInterface<"string">
  | ParamOptionInterface<"string[]">;

export function useQueryParams<
  TParams extends Record<string, ParamOptionTypes | ParamOptionType>,
  TKeys extends keyof TParams & string,
  TResult extends {
    [TKey in TKeys]: TParams[TKey] extends ParamOptionTypes
      ? inferParamType<TParams[TKey]>
      : TParams[TKey] extends ParamOptionInterface<infer TType>
      ? TParams[TKey]["default"] extends inferParamType<TType>
        ? TParams[TKey]["default"]
        : inferParamType<TType>
      : never;
  },
  TSetParams extends Partial<
    {
      [TKey in keyof TResult]: TResult[TKey] | string;
    }
  >
>(params: TParams, opts?: UseQueryParamsOptions) {
  const router = useRouter();
  const query = router.query;

  const defaultValues = useMemo(() => {
    const obj: Record<string, unknown> = {};
    for (const key in params) {
      obj[key] =
        typeof params[key] === "string"
          ? undefined
          : (params[key] as any).default;
    }

    return obj;
  }, []);

  const transform = useCallback((key: string, value: unknown) => {
    const type = (typeof params[key] === "string"
      ? params[key]
      : (params[key] as any).type) as ParamOptionTypes;

    if (typeof value === "undefined") {
      return defaultValues[key];
    }

    if (type.endsWith("[]")) {
      return toArray(value)
        .map((v: unknown) => typecast(v, type))
        .filter((v) => typeof v !== "undefined");
    }
    return typecast(value, type);
  }, []);

  const result = useMemo(() => {
    const obj: Record<string, unknown> = {};
    for (const key in params) {
      const value = query[key];
      obj[key] = transform(key as any, value);
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
        const raw = newObj[key];
        const value = transform(key, raw);
        if (typeof value !== "undefined" && value !== defaultValues[key]) {
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
