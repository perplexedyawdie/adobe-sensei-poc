import '../styles/globals.css'
import type { AppProps } from 'next/app'
import 'bulma/css/bulma.min.css'
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css"
import Head from 'next/head'
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Sensei Cutout API</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Component {...pageProps} />
    </>
  )
}

export default MyApp
