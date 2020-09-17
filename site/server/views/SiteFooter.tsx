import * as React from "react"
import { webpack } from "utils/server/staticGen"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faAngleRight } from "@fortawesome/free-solid-svg-icons/faAngleRight"
import { BAKED_BASE_URL } from "settings"

export const SiteFooter = ({
    hideDonate = false,
}: {
    hideDonate?: boolean
}) => {
    return (
        <React.Fragment>
            {!hideDonate && (
                <section className="donate-footer">
                    <div className="wrapper">
                        <div className="owid-row flex-align-center">
                            <div className="owid-col owid-col--lg-3 owid-padding-bottom--sm-3">
                                <p>
                                    Our World in Data is free and accessible for
                                    everyone.
                                </p>
                                <p>
                                    Help us do this work by making a donation.
                                </p>
                            </div>
                            <div className="owid-col owid-col--lg-1">
                                <a
                                    href="/donate"
                                    className="owid-button donate-button"
                                    data-track-note="donate-footer"
                                >
                                    <span className="label">Donate now</span>
                                    <span className="icon">
                                        <FontAwesomeIcon icon={faAngleRight} />
                                    </span>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>
            )}
            <footer className="site-footer">
                <div className="wrapper">
                    <div className="owid-row">
                        <div className="owid-col owid-col--lg-1">
                            <ul>
                                <li>
                                    <a
                                        href="/about"
                                        data-track-note="footer-navigation"
                                    >
                                        About
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/about#contact"
                                        data-track-note="footer-navigation"
                                    >
                                        Contact
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/feedback"
                                        data-track-note="footer-navigation"
                                    >
                                        Feedback
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/jobs"
                                        data-track-note="footer-navigation"
                                    >
                                        Jobs
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/supporters"
                                        data-track-note="footer-navigation"
                                    >
                                        Supporters
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/about/how-to-use-our-world-in-data"
                                        data-track-note="footer-navigation"
                                    >
                                        How to use
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/donate"
                                        data-track-note="footer-navigation"
                                    >
                                        Donate
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/privacy-policy"
                                        data-track-note="footer-navigation"
                                    >
                                        Privacy policy
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="owid-col owid-col--lg-1">
                            <ul>
                                <li>
                                    <a
                                        href="/blog"
                                        data-track-note="footer-navigation"
                                    >
                                        Latest publications
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/charts"
                                        data-track-note="footer-navigation"
                                    >
                                        All charts
                                    </a>
                                </li>
                            </ul>
                            <ul>
                                <li>
                                    <a
                                        href="https://twitter.com/OurWorldInData"
                                        data-track-note="footer-navigation"
                                    >
                                        Twitter
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://www.facebook.com/OurWorldinData"
                                        data-track-note="footer-navigation"
                                    >
                                        Facebook
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="https://github.com/owid"
                                        data-track-note="footer-navigation"
                                    >
                                        GitHub
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href="/feed"
                                        data-track-note="footer-navigation"
                                    >
                                        RSS Feed
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div className="owid-col owid-col--lg-1">
                            <div className="logos">
                                <a
                                    href="https://www.oxfordmartin.ox.ac.uk/research/programmes/global-development"
                                    className="partner-logo"
                                    data-track-note="footer-navigation"
                                >
                                    <img
                                        src={`${BAKED_BASE_URL}/oms-logo.svg`}
                                        alt="Oxford Martin School logo"
                                        loading="lazy"
                                    />
                                </a>
                                <a
                                    href="/owid-at-ycombinator"
                                    className="partner-logo"
                                    data-track-note="footer-navigation"
                                >
                                    <img
                                        src={`${BAKED_BASE_URL}/yc-logo.png`}
                                        alt="Y Combinator logo"
                                        loading="lazy"
                                    />
                                </a>
                            </div>
                        </div>
                        <div className="owid-col flex-2">
                            <div className="legal">
                                <p>
                                    License: All of Our World in Data is
                                    completely open access and all work is
                                    licensed under the{" "}
                                    <a href="https://creativecommons.org/licenses/by/4.0/">
                                        Creative Commons BY license
                                    </a>
                                    . You have the permission to use,
                                    distribute, and reproduce in any medium,
                                    provided the source and authors are
                                    credited.
                                </p>
                                <p>
                                    Please consult our full{" "}
                                    <a href="/about#legal">legal disclaimer</a>.
                                </p>
                                <p>
                                    <a
                                        href="https://global-change-data-lab.org/"
                                        className="partner-logo gcdl-logo"
                                        data-track-note="footer-navigation"
                                    >
                                        <img
                                            src={`${BAKED_BASE_URL}/gcdl-logo-narrow.png`}
                                            alt="Global Change Data Lab logo"
                                            loading="lazy"
                                        />
                                    </a>
                                    Our World In Data is a project of the{" "}
                                    <a href="https://global-change-data-lab.org/">
                                        Global Change Data Lab
                                    </a>
                                    , a registered charity in England and Wales
                                    (Charity Number 1186433).
                                </p>
                                {/* <a href="/" className="owid-logo">Our World in Data</a> */}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="site-tools" />
                <script src="https://cdn.polyfill.io/v2/polyfill.min.js?features=es6,fetch" />
                <script src={webpack("commons.js", "site")} />
                <script src={webpack("owid.js", "site")} />
                <script
                    dangerouslySetInnerHTML={{
                        __html: `
                runHeaderMenus();
                runBlocks();
                runLightbox();
                runSiteTools();
                runCookieNotice();
                runCovid();
                runFootnotes();
                if (!document.querySelector(".ChartPage")) {
                    GrapherPageUtils.embedAll();
                    runGlobalEntityControl(GrapherPageUtils.globalEntitySelection);
                }
            `,
                    }}
                />
            </footer>
        </React.Fragment>
    )
}
