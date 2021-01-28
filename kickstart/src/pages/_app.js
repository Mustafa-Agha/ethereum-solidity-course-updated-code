import Head from 'next/head';
import 'semantic-ui-css/semantic.min.css';
import '../styles/globals.css';

function App({ Component, pageProps }) {
  return(
    <>
      <Head>
        <title>Crowd Funding</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
};

export default App;
