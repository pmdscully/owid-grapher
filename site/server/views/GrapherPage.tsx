import { BAKED_GRAPHER_URL } from "settings"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFileAlt } from "@fortawesome/free-solid-svg-icons/faFileAlt"

import * as React from "react"
import urljoin from "url-join"
import * as lodash from "lodash"
import { GrapherInterface } from "grapher/core/GrapherInterface"
import { SiteHeader } from "./SiteHeader"
import { SiteFooter } from "./SiteFooter"
import { Head } from "./Head"
import { Post } from "db/model/Post"
import { RelatedChart } from "site/client/blocks/RelatedCharts/RelatedCharts"
import { ChartListItemVariant } from "./ChartListItemVariant"
import { LoadingIndicator } from "grapher/loadingIndicator/LoadingIndicator"
import { EmbedDetector } from "./EmbedDetector"

export const GrapherPage = (props: {
    grapher: GrapherInterface
    post?: Post.Row
    relatedCharts?: RelatedChart[]
}) => {
    const { grapher, post, relatedCharts } = props

    const pageTitle = grapher.title
    const pageDesc =
        grapher.subtitle ||
        "An interactive visualization from Our World in Data."
    const canonicalUrl = urljoin(BAKED_GRAPHER_URL, grapher.slug as string)
    const imageUrl = urljoin(
        BAKED_GRAPHER_URL,
        "exports",
        `${grapher.slug}.png?v=${grapher.version}`
    )

    const script = `
        var jsonConfig = ${JSON.stringify(grapher)};
        var figure = document.getElementsByTagName("figure")[0];

        try {
            var view = window.GrapherView.bootstrap({
                jsonConfig: jsonConfig,
                containerNode: figure,
                queryStr: window.location.search
            });
            view.bindToWindow();
        } catch (err) {
            figure.innerHTML = "<img src=\\"/grapher/exports/${
                grapher.slug
            }.svg\\"/><p>Unable to load interactive visualization</p>";
            figure.setAttribute("id", "fallback");
            throw err;
        }
    `

    const variableIds = lodash.uniq(
        grapher.dimensions!.map((d) => d.variableId)
    )

    return (
        <html>
            <Head
                canonicalUrl={canonicalUrl}
                pageTitle={pageTitle}
                pageDesc={pageDesc}
                imageUrl={imageUrl}
            >
                <meta property="og:image:width" content="850" />
                <meta property="og:image:height" content="600" />
                <EmbedDetector />
                <noscript>
                    <style>{`
                    figure { display: none !important; }
                `}</style>
                </noscript>
                <link
                    rel="preload"
                    href={`/grapher/data/variables/${variableIds.join(
                        "+"
                    )}.json?v=${grapher.version}`}
                    as="fetch"
                    crossOrigin="anonymous"
                />
            </Head>
            <body className="ChartPage">
                <SiteHeader />
                <main>
                    <figure data-grapher-src={`/grapher/${grapher.slug}`}>
                        <LoadingIndicator color="#333" />
                    </figure>
                    <noscript id="fallback">
                        <img
                            src={`${BAKED_GRAPHER_URL}/exports/${grapher.slug}.svg`}
                        />
                        <p>Interactive visualization requires JavaScript</p>
                    </noscript>

                    {post && (
                        <div className="related-research-data">
                            <h2>All our research and data on {post.title}</h2>
                            <div className="research">
                                <a href={`/${post.slug}`}>
                                    <FontAwesomeIcon icon={faFileAlt} />
                                    Read the article
                                </a>
                            </div>
                            {relatedCharts && relatedCharts.length !== 0 && (
                                <>
                                    <h3>Charts</h3>
                                    <ul>
                                        {relatedCharts
                                            .filter(
                                                (chartItem) =>
                                                    chartItem.slug !==
                                                    grapher.slug
                                            )
                                            .map((c) => (
                                                <ChartListItemVariant
                                                    key={c.slug}
                                                    chart={c}
                                                />
                                            ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    )}
                </main>
                <SiteFooter />
                <script dangerouslySetInnerHTML={{ __html: script }} />
            </body>
        </html>
    )
}
