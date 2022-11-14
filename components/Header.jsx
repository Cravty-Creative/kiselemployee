import Head from "next/head";

export default function Header({ pageTitle }) {
  return (
    <Head>
      <meta charSet="UTF-8" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="keywords" content="Learning Management System" />
      <meta name="description" content="Learning Management System" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{pageTitle} - Kisel Employee</title>
      <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
    </Head>
  );
}
