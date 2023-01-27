import Head from "next/head";

export default function PageHeader({ title }) {
  return (
    <Head>
      <title>{`Kisel Employee - ${title}`}</title>
      <meta name="description" content="Aplikasi Sistem Penunjang Keputusan" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/favicon.ico" />
    </Head>
  );
}
