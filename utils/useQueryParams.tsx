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
  ? string
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
  if (type === "boolean") {
    return value === "true" || value === true;
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

function isEqual(a: unknown, b: unknown) {
  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && !a.some((v, index) => v !== b[index]);
  }
  return a === b;
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
      [TKey in keyof TResult]: TResult[TKey] | string | undefined;
    }
  >
>(_params: TParams, _opts?: UseQueryParamsOptions) {
  const router = useRouter();
  const query = router.query;

  const optsRef = useRef(_opts);
  optsRef.current = _opts;
  const paramsRef = useRef(_params);
  paramsRef.current = _params;

  const defaultValues = useMemo(() => {
    const obj: Record<string, unknown> = {};
    const params = paramsRef.current;
    for (const key in params) {
      const param = params[key];
      const type: ParamOptionTypes =
        typeof param === "string" ? param : (param as any).type;
      let value =
        typeof param === "string" ? undefined : (param as any).default;

      if (typeof value === "undefined") {
        if (type.endsWith("[]")) {
          value = [];
        } else if (type === "string") {
          value = "";
        } else if (type === "boolean") {
          value = false;
        }
      }
      obj[key] = value;
    }

    return obj;
  }, []);

  const transform = useCallback((key: string, value: unknown) => {
    const params = paramsRef.current;
    const type = (typeof params[key] === "string"
      ? params[key]
      : (params[key] as any).type) as ParamOptionTypes;

    if (typeof value === "undefined") {
      return defaultValues[key];
    }

    if (type.endsWith("[]")) {
      return toArray(value)
        .map((v: unknown) => typecast(v, type))
        .filter((v) => typeof v !== "undefined")
        .filter((v) => v !== "_empty");
    }
    return typecast(value, type);
  }, []);

  const result = useMemo(() => {
    const obj: Record<string, unknown> = {};
    for (const key in paramsRef.current) {
      const value = query[key];
      obj[key] = transform(key as any, value);
    }
    return obj as TResult;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const setParams = useCallback(
    (newObj: TSetParams) => {
      const newQuery: Record<string, unknown> = {
        ...router.query,
      };
      const params = paramsRef.current;
      const opts = optsRef.current;

      for (const key in newObj) {
        const raw = newObj[key];
        const value = transform(key, raw);
        const defaultValue = defaultValues[key];
        if (
          Array.isArray(defaultValue) &&
          Array.isArray(value) &&
          value.length === 0
        ) {
          newQuery[key] = "_empty";
        } else if (
          typeof value !== "undefined" &&
          !isEqual(value, defaultValues[key])
        ) {
          newQuery[key] = value;
        } else {
          delete newQuery[key];
        }
      }

      router[opts?.type ?? "push"]({ query: newQuery as any }, undefined, {
        scroll: false,
        ...(opts?.transitionOptions ?? {}),
      });
    },
    [router],
  );

  const setParam = useCallback(
    <TKey extends keyof TSetParams & string>(
      key: TKey,
      value: TSetParams[TKey],
    ) => {
      setParams({
        [key]: value,
      } as any);
    },
    [setParams],
  );
  return { setParams, setParam, params: result };
}
