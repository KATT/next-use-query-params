import type { AppProps /*, AppContext */ } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />;
}

/**
 * this is just here in order to disable SSG
 * makes `useRouter().query` work server-side
 */
async function getInitialProps() {
  return {};
}

(MyApp as any).getInitialProps = getInitialProps;

export default MyApp;
