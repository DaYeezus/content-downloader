import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head
        title="Album Downloader"
        about="Album downloader application that you can download albums you want from youtube tracks or playlist or soundcloud as a zip or mp3 file"
      />
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
