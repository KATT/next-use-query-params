import Head from "next/head";
import { useQueryParams } from "../utils/useQueryParams";

export default function Home() {
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
            defaultValue={params.num}
            onChange={(e) => {
              setParams({
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
                bool: e.target.checked,
              });
            }}
          />
        </label>
        <br />

        <br />

        <label>
          checky
          <input
            type='checkbox'
            name='checky'
            value='1'
            checked={params.checky.includes("1")}
            onChange={(e) => {
              const next = params.checky.filter((v) => v !== e.target.value);
              if (!params.checky.includes(e.target.value) && e.target.checked) {
                next.push(e.target.value);
              }
              setParams({ checky: next });
            }}
          />
          <input
            type='checkbox'
            name='checky'
            value='2'
            checked={params.checky.includes("2")}
            onChange={(e) => {
              const next = params.checky.filter((v) => v !== e.target.value);
              if (!params.checky.includes(e.target.value) && e.target.checked) {
                next.push(e.target.value);
              }
              setParams({ checky: next });
            }}
          />
          <input
            type='checkbox'
            name='checky'
            value='3'
            checked={params.checky.includes("3")}
            onChange={(e) => {
              const next = params.checky.filter((v) => v !== e.target.value);
              if (!params.checky.includes(e.target.value) && e.target.checked) {
                next.push(e.target.value);
              }
              setParams({ checky: next });
            }}
          />
        </label>
        <br />
      </form>
      <h2>Result</h2>
      <pre>{JSON.stringify(params, null, 4)}</pre>
    </>
  );
}

export async function getInitialProps() {
  return {};
}
