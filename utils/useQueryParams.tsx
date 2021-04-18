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
>(params: TParams, opts?: UseQueryParamsOptions) {
  const router = useRouter();
  const query = router.query;

  const optsRef = useRef(opts);
  optsRef.current = opts;
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const defaultValues = useMemo(() => {
    const obj: Record<string, unknown> = {};
    const p = paramsRef.current;
    for (const key in p) {
      const param = p[key];
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
    const type = (typeof paramsRef.current[key] === "string"
      ? paramsRef.current[key]
      : (paramsRef.current[key] as any).type) as ParamOptionTypes;

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
    for (const key in paramsRef.current) {
      const value = query[key];
      obj[key] = transform(key as any, value);
    }
    return obj as TResult;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const setParams = useCallback(
    (newObj: TSetParams) => {
      const q: Record<string, unknown> = {
        ...router.query,
      };

      for (const key in newObj) {
        const raw = newObj[key];
        const value = transform(key, raw);
        if (
          typeof value !== "undefined" &&
          !isEqual(value, defaultValues[key])
        ) {
          q[key] = value;
        } else {
          delete q[key];
        }
      }

      router[optsRef.current?.type ?? "push"]({ query: q as any }, undefined, {
        scroll: false,
        ...(optsRef.current?.transitionOptions ?? {}),
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
