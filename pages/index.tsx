import Head from "next/head";
import { useQueryParams } from "../utils/useQueryParams";

export default function Home() {
  const { setParams, setParam, params } = useQueryParams(
    {
      str: "string",
      num: "number",
      pets: "string[]",
      bool: "boolean",
      anotherString: "string",
    },
    {
      type: "push",
      transitionOptions: {
        scroll: false,
      },
    },
  );

  return (
    <>
      <Head>
        <title>useQueryParams</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <h1>
        <code>useQueryParams</code>
      </h1>
      <form>
        <label>
          str
          <input
            type='string'
            defaultValue={params.str ?? ""}
            onChange={(e) => {
              setParams({
                ...params,
                str: e.target.value,
              });
            }}
          />
        </label>
        <br />
        <label>
          num
          <input
            type='number'
            defaultValue={params.num ?? 0}
            onChange={(e) => {
              setParams({
                ...params,
                num: e.target.value,
              });
            }}
          />
        </label>
        <br />

        <label>
          pets
          <br />
          <select
            name='pets'
            id='pet-select'
            multiple
            defaultValue={params.pets}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions).map(
                (o) => o.value,
              );
              setParams({
                ...params,
                pets: values,
              });
            }}
          >
            <option value='dog'>Dog</option>
            <option value='cat'>Cat</option>
            <option value='hamster'>Hamster</option>
          </select>
        </label>
        <br />

        <label>
          bool
          <input
            type='checkbox'
            checked={params.bool ?? false}
            onChange={(e) => {
              setParams({
                ...params,
                bool: e.target.checked,
              });
            }}
          />
        </label>
        <br />

        <label>
          anotherString{" "}
          <em>
            (using <code>setParam()</code>)
          </em>
          <input
            type='string'
            defaultValue={params.anotherString ?? ""}
            onChange={(e) => {
              setParam("anotherString", e.target.value);
            }}
          />
        </label>
      </form>
      <h2>Result</h2>
      <pre>{JSON.stringify(params, null, 4)}</pre>
    </>
  );
}

export async function getInitialProps() {
  return {};
}
