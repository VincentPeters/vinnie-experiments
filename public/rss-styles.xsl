<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>RSS · <xsl:value-of select="/rss/channel/title"/></title>
        <meta name="robots" content="noindex"/>
        <style>
          @font-face {
            font-family: "Source Serif 4";
            src: url("/fonts/SourceSerif4-400.woff2") format("woff2");
            font-weight: 400; font-style: normal; font-display: swap;
          }
          @font-face {
            font-family: "Source Serif 4";
            src: url("/fonts/SourceSerif4-400i.woff2") format("woff2");
            font-weight: 400; font-style: italic; font-display: swap;
          }
          @font-face {
            font-family: "Switzer";
            src: url("/fonts/Switzer-600.woff2") format("woff2");
            font-weight: 600; font-style: normal; font-display: swap;
          }
          @font-face {
            font-family: "Switzer";
            src: url("/fonts/Switzer-700.woff2") format("woff2");
            font-weight: 700; font-style: normal; font-display: swap;
          }
          @font-face {
            font-family: "JetBrains Mono";
            src: url("/fonts/JetBrainsMono-400.woff2") format("woff2");
            font-weight: 400; font-style: normal; font-display: swap;
          }
          @font-face {
            font-family: "JetBrains Mono";
            src: url("/fonts/JetBrainsMono-700.woff2") format("woff2");
            font-weight: 700; font-style: normal; font-display: swap;
          }
          :root {
            --paper: oklch(98% 0.012 85);
            --paper-subtle: oklch(95% 0.018 85);
            --paper-edge: oklch(92% 0.022 85);
            --ink: oklch(22% 0.04 250);
            --ink-muted: oklch(50% 0.02 250);
            --ink-faint: oklch(70% 0.015 250);
            --signal: oklch(55% 0.18 25);
            --signal-deep: oklch(45% 0.18 25);
            --marker: oklch(88% 0.14 95);
            --marker-soft: oklch(88% 0.14 95 / 0.45);
            --hairline: 1px solid var(--paper-edge);
            --container: 100ch;
            --measure-prose: 70ch;
            --pad-x: 1rem;
            --pad-x-md: 1.5rem;
            --pad-x-lg: 2.5rem;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --paper: oklch(18% 0.012 250);
              --paper-subtle: oklch(22% 0.015 250);
              --paper-edge: oklch(28% 0.018 250);
              --ink: oklch(96% 0.005 85);
              --ink-muted: oklch(68% 0.018 250);
              --ink-faint: oklch(45% 0.015 250);
              --signal: oklch(68% 0.155 25);
              --signal-deep: oklch(78% 0.14 25);
              --marker: oklch(58% 0.12 95);
              --marker-soft: oklch(58% 0.12 95 / 0.32);
            }
          }
          *, *::before, *::after { box-sizing: border-box; }
          html { background: var(--paper); color: var(--ink); }
          body {
            font-family: "Source Serif 4", ui-serif, Georgia, serif;
            font-size: 17px;
            line-height: 1.6;
            margin: 0;
            -webkit-font-smoothing: antialiased;
          }
          a {
            color: inherit;
            text-decoration-line: underline;
            text-decoration-style: dotted;
            text-decoration-thickness: 1px;
            text-underline-offset: 3px;
          }
          a:hover, a:focus-visible {
            color: var(--signal-deep);
            text-decoration-style: solid;
            text-decoration-thickness: 2px;
          }

          .bar { border-block-end: var(--hairline); }
          .inner {
            max-width: var(--container);
            margin: 0;
            padding: 1rem var(--pad-x);
          }
          @media (min-width: 720px) {
            .inner { padding: 1rem var(--pad-x-md); }
          }
          @media (min-width: 1024px) {
            .inner { padding: 1rem var(--pad-x-lg); }
          }
          .brand-bar .inner {
            padding-block: 2.5rem 1rem;
            display: flex; flex-direction: column; gap: 0.5rem;
          }
          .wordmark {
            font-family: "JetBrains Mono", ui-monospace, monospace;
            font-weight: 700;
            font-size: 1.4rem;
            letter-spacing: -0.01em;
            color: var(--ink);
            text-decoration: none;
            align-self: flex-start;
          }
          .wordmark .signal { color: var(--signal); }
          .subtitle {
            font-family: "Source Serif 4", ui-serif, Georgia, serif;
            font-style: italic;
            font-size: 0.95rem;
            color: var(--ink-muted);
            margin: 0;
            max-width: 60ch;
          }
          .stamp-bar .inner {
            padding-block: 0.5rem;
            font-family: "JetBrains Mono", ui-monospace, monospace;
            font-size: 0.78rem;
            letter-spacing: 0.04em;
            color: var(--ink-muted);
          }
          .stamp-bar .stamp {
            color: var(--signal);
            font-weight: 700;
            text-transform: uppercase;
            margin-inline-end: 1rem;
          }
          .info-bar .inner {
            padding-block: 0.75rem;
            font-family: "Source Serif 4", ui-serif, Georgia, serif;
            font-size: 0.95rem;
            color: var(--ink-muted);
            font-style: italic;
            max-width: var(--container);
          }
          .info-bar code {
            font-family: "JetBrains Mono", ui-monospace, monospace;
            font-style: normal;
            font-size: 0.88rem;
            color: var(--ink);
            background: var(--paper-subtle);
            padding: 0.05rem 0.3rem;
            border-radius: 2px;
          }
          main {
            max-width: var(--container);
            margin: 0;
            padding: 1.5rem var(--pad-x) 4rem;
          }
          @media (min-width: 720px) {
            main { padding: 1.5rem var(--pad-x-md) 4rem; }
          }
          @media (min-width: 1024px) {
            main { padding: 1.5rem var(--pad-x-lg) 4rem; }
          }
          .year-marker {
            font-family: "JetBrains Mono", ui-monospace, monospace;
            font-size: 1.05rem;
            font-weight: 700;
            letter-spacing: 0.02em;
            color: var(--signal);
            margin: 1.5rem 0 0.5rem;
          }
          .year-marker:first-of-type { margin-top: 0; }
          ol { list-style: none; padding: 0; margin: 0; }
          li {
            display: grid;
            grid-template-columns: 12ch 1fr;
            column-gap: 1rem;
            align-items: baseline;
            padding: 0.5rem 0;
            border-block-end: var(--hairline);
          }
          @media (max-width: 540px) {
            li {
              grid-template-columns: 1fr;
              row-gap: 0.25rem;
            }
          }
          .row-date {
            font-family: "JetBrains Mono", ui-monospace, monospace;
            font-size: 0.78rem;
            letter-spacing: 0.04em;
            color: var(--ink-muted);
            white-space: nowrap;
          }
          .row-title a {
            font-family: "Switzer", ui-sans-serif, sans-serif;
            font-size: 1.05rem;
            font-weight: 600;
            letter-spacing: -0.01em;
            color: var(--ink);
            text-decoration: none;
          }
          .row-title a:hover {
            text-decoration: underline;
            text-decoration-thickness: 2px;
            text-underline-offset: 3px;
            color: var(--signal-deep);
          }
          .row-desc {
            display: block;
            font-family: "Source Serif 4", ui-serif, Georgia, serif;
            font-style: italic;
            font-size: 0.95rem;
            color: var(--ink-muted);
            margin-top: 0.25rem;
            max-width: var(--measure-prose);
          }
        </style>
      </head>
      <body>
        <header class="brand-bar bar">
          <div class="inner">
            <a class="wordmark" href="/">
              vinnie<span class="signal">-</span>experiments
            </a>
            <p class="subtitle"><xsl:value-of select="/rss/channel/description"/></p>
          </div>
        </header>
        <div class="stamp-bar bar">
          <div class="inner">
            <span class="stamp">RSS feed</span>
            <span>this is the feed view. <a href="/">back to the site</a>.</span>
          </div>
        </div>
        <div class="info-bar bar">
          <div class="inner">
            Paste this URL into a feed reader to subscribe.
            Tested with <a href="https://feedbin.com">Feedbin</a>,
            <a href="https://netnewswire.com">NetNewsWire</a>,
            <a href="https://newsblur.com">NewsBlur</a>.
            URL: <code><xsl:value-of select="/rss/channel/link"/>rss.xml</code>
          </div>
        </div>
        <main>
          <h2 class="year-marker">entries</h2>
          <ol>
            <xsl:for-each select="/rss/channel/item">
              <li>
                <span class="row-date">
                  <xsl:value-of select="substring(pubDate, 6, 11)"/>
                </span>
                <span class="row-title">
                  <a>
                    <xsl:attribute name="href">
                      <xsl:value-of select="link"/>
                    </xsl:attribute>
                    <xsl:value-of select="title"/>
                  </a>
                  <span class="row-desc">
                    <xsl:value-of select="description"/>
                  </span>
                </span>
              </li>
            </xsl:for-each>
          </ol>
        </main>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
