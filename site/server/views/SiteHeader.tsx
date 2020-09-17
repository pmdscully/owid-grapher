import * as React from "react"
import { faSearch } from "@fortawesome/free-solid-svg-icons/faSearch"
import { faBars } from "@fortawesome/free-solid-svg-icons/faBars"
import { faEnvelopeOpenText } from "@fortawesome/free-solid-svg-icons/faEnvelopeOpenText"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { AlertBanner } from "./AlertBanner"

import { BAKED_BASE_URL } from "settings"

export interface SiteHeaderProps {
    hideAlertBanner: boolean
}

const DEFAULT_PROPS: SiteHeaderProps = {
    hideAlertBanner: false,
}

export const SiteHeader = (overrideProps: Partial<SiteHeaderProps>) => {
    const props: SiteHeaderProps = {
        ...DEFAULT_PROPS,
        ...overrideProps,
    }
    return (
        <>
            <header className="site-header">
                <div className="wrapper site-navigation-bar">
                    <div className="site-logo">
                        <a href="/">
                            Our World
                            <br /> in Data
                        </a>
                    </div>
                    <nav className="site-navigation">
                        <div className="topics-button-wrapper">
                            <a href="/#entries" className="topics-button">
                                <div className="label">
                                    Articles <br />
                                    <strong>by topic</strong>
                                </div>
                                <div className="icon">
                                    <svg width="12" height="6">
                                        <path
                                            d="M0,0 L12,0 L6,6 Z"
                                            fill="currentColor"
                                        />
                                    </svg>
                                </div>
                            </a>
                        </div>
                        <div>
                            <div className="site-primary-navigation">
                                <form
                                    className="HeaderSearch"
                                    action="/search"
                                    method="GET"
                                >
                                    <input
                                        type="search"
                                        name="q"
                                        placeholder="Search..."
                                    />
                                    <div className="icon">
                                        <FontAwesomeIcon icon={faSearch} />
                                    </div>
                                </form>
                                <ul className="site-primary-links">
                                    <li>
                                        <a
                                            href="/blog"
                                            data-track-note="header-navigation"
                                        >
                                            Latest
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="/about"
                                            data-track-note="header-navigation"
                                        >
                                            About
                                        </a>
                                    </li>
                                    <li>
                                        <a
                                            href="/donate"
                                            data-track-note="header-navigation"
                                        >
                                            Donate
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div className="site-secondary-navigation">
                                <ul className="site-secondary-links">
                                    <li>
                                        <a
                                            href="/charts"
                                            data-track-note="header-navigation"
                                        >
                                            All charts
                                        </a>
                                    </li>
                                    {/* <li><a href="/teaching"  data-track-note="header-navigation">Teaching Hub</a></li> */}
                                    <li>
                                        <a
                                            href="https://sdg-tracker.org"
                                            data-track-note="header-navigation"
                                        >
                                            Sustainable Development Goals
                                            Tracker
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </nav>
                    <div className="header-logos-wrapper">
                        <a
                            href="https://www.oxfordmartin.ox.ac.uk/global-development"
                            className="oxford-logo"
                        >
                            <img
                                src={`${BAKED_BASE_URL}/oms-logo.svg`}
                                alt="Oxford Martin School logo"
                            />
                        </a>
                        <a
                            href="https://global-change-data-lab.org/"
                            className="gcdl-logo"
                        >
                            <img
                                src={`${BAKED_BASE_URL}/gcdl-logo-narrow.png`}
                                alt="Global Change Data Lab logo"
                            />
                        </a>
                    </div>
                    <div className="mobile-site-navigation">
                        <button data-track-note="mobile-search-button">
                            <FontAwesomeIcon icon={faSearch} />
                        </button>
                        <button data-track-note="mobile-newsletter-button">
                            <FontAwesomeIcon icon={faEnvelopeOpenText} />
                        </button>
                        <button data-track-note="mobile-hamburger-button">
                            <FontAwesomeIcon icon={faBars} />
                        </button>
                    </div>
                </div>
            </header>
            {!props.hideAlertBanner && <AlertBanner />}
        </>
    )
}

// The logo that's shown on all the charts.

// const Logo = () => (
//     <svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="100" viewBox="0 0 211.2 130.1">
//         <g>
//             <rect x="0" y="0" fill="#1B2543" width="211.2" height="130.1"/>
//             <rect x="0" y="112.2" fill="#E63912" width="211.2" height="17.9"/>
//             <g>
//                 <rect x="1.2" y="12.3" fill="none" width="210.2" height="99.2"/>
//                 <path fill="#FFFFFF" d="M37.8,32.2c0,12.7-7.7,19.4-17.1,19.4c-9.7,0-16.6-7.5-16.6-18.7c0-11.7,7.3-19.3,17.1-19.3 C31.3,13.7,37.8,21.3,37.8,32.2z M9.2,32.8c0,7.9,4.3,14.9,11.8,14.9c7.5,0,11.8-6.9,11.8-15.3c0-7.3-3.8-14.9-11.8-14.9 C13.1,17.5,9.2,24.8,9.2,32.8z"/>
//                 <path fill="#FFFFFF" d="M62.7,43.8c0,2.7,0.1,5.1,0.2,7.2h-4.3l-0.3-4.3h-0.1c-1.3,2.1-4,4.9-8.8,4.9c-4.2,0-9.1-2.3-9.1-11.6 V24.6h4.8v14.6c0,5,1.5,8.4,5.9,8.4c3.2,0,5.5-2.2,6.3-4.4c0.3-0.7,0.4-1.6,0.4-2.5V24.6h4.8V43.8z"/>
//                 <path fill="#FFFFFF" d="M67.3,32.8c0-3.1-0.1-5.8-0.2-8.2h4.2l0.2,5.2h0.2c1.2-3.5,4.1-5.8,7.3-5.8c0.5,0,0.9,0.1,1.4,0.2v4.5 c-0.5-0.1-1-0.2-1.6-0.2c-3.4,0-5.8,2.6-6.5,6.2c-0.1,0.7-0.2,1.4-0.2,2.2V51h-4.8V32.8z"/>
//                 <path fill="#FFFFFF" d="M95.4,51l-9.4-36.8h5l4.4,18.6c1.1,4.6,2.1,9.2,2.7,12.7h0.1c0.6-3.7,1.8-8,3-12.8l4.9-18.5h5l4.5,18.7 c1,4.4,2,8.7,2.6,12.6h0.1c0.8-4,1.8-8.1,3-12.7l4.9-18.5h4.9L120.6,51h-5L111,31.9c-1.1-4.7-1.9-8.3-2.4-12h-0.1 c-0.7,3.7-1.5,7.3-2.8,12L100.4,51H95.4z"/>
//                 <path fill="#FFFFFF" d="M154.9,37.6c0,9.8-6.8,14-13.2,14c-7.2,0-12.7-5.2-12.7-13.6c0-8.8,5.8-14,13.1-14 C149.8,24,154.9,29.5,154.9,37.6z M133.9,37.9c0,5.8,3.3,10.1,8,10.1c4.6,0,8-4.3,8-10.3c0-4.5-2.2-10.1-7.9-10.1 C136.3,27.6,133.9,32.8,133.9,37.9z"/>
//                 <path fill="#FFFFFF" d="M158.2,32.8c0-3.1-0.1-5.8-0.2-8.2h4.2l0.2,5.2h0.2c1.2-3.5,4.1-5.8,7.3-5.8c0.5,0,0.9,0.1,1.4,0.2v4.5 c-0.5-0.1-1-0.2-1.6-0.2c-3.4,0-5.8,2.6-6.5,6.2c-0.1,0.7-0.2,1.4-0.2,2.2V51h-4.8V32.8z"/>
//                 <path fill="#FFFFFF" d="M173.5,12.3h4.8V51h-4.8V12.3z"/>
//                 <path fill="#FFFFFF" d="M206.5,12.3v31.9c0,2.3,0.1,5,0.2,6.8h-4.3l-0.2-4.6H202c-1.5,2.9-4.7,5.2-9,5.2 c-6.4,0-11.3-5.4-11.3-13.4c-0.1-8.8,5.4-14.2,11.9-14.2c4,0,6.8,1.9,8,4h0.1V12.3H206.5z M201.7,35.4c0-0.6-0.1-1.4-0.2-2 c-0.7-3.1-3.3-5.6-6.9-5.6c-5,0-7.9,4.4-7.9,10.2c0,5.3,2.6,9.8,7.8,9.8c3.2,0,6.2-2.1,7.1-5.7c0.2-0.7,0.2-1.3,0.2-2.1V35.4z"/>
//                 <path fill="#FFFFFF" d="M42.8,64c0.1,1.6-1.1,2.9-3.1,2.9c-1.7,0-2.9-1.3-2.9-2.9c0-1.7,1.3-3,3-3C41.7,61,42.8,62.3,42.8,64z M37.4,97.8V71.4h4.8v26.4H37.4z"/>
//                 <path fill="#FFFFFF" d="M47.5,78.6c0-2.7-0.1-5-0.2-7.1h4.3l0.3,4.4h0.1c1.3-2.5,4.4-5,8.8-5c3.7,0,9.4,2.2,9.4,11.2v15.8h-4.8 V82.6c0-4.3-1.6-7.8-6.1-7.8c-3.2,0-5.6,2.2-6.5,4.9c-0.2,0.6-0.3,1.4-0.3,2.2v15.9h-4.8V78.6z"/>
//                 <path fill="#FFFFFF" d="M84,61.6c2.9-0.4,6.3-0.8,10.1-0.8c6.8,0,11.7,1.6,14.9,4.6c3.3,3,5.2,7.3,5.2,13.2c0,6-1.9,10.9-5.3,14.3 c-3.4,3.4-9.1,5.3-16.3,5.3c-3.4,0-6.2-0.2-8.6-0.4V61.6z M88.8,94.1c1.2,0.2,3,0.3,4.8,0.3c10.2,0,15.7-5.7,15.7-15.6 c0.1-8.7-4.9-14.2-14.9-14.2c-2.5,0-4.3,0.2-5.6,0.5V94.1z"/>
//                 <path fill="#FFFFFF" d="M132.1,97.8l-0.4-3.3h-0.2c-1.5,2.1-4.3,3.9-8.1,3.9c-5.4,0-8.1-3.8-8.1-7.6c0-6.4,5.7-9.9,15.9-9.8v-0.5 c0-2.2-0.6-6.1-6-6.1c-2.5,0-5,0.8-6.9,2l-1.1-3.2c2.2-1.4,5.4-2.3,8.7-2.3c8.1,0,10.1,5.5,10.1,10.8v9.9c0,2.3,0.1,4.5,0.4,6.3 H132.1z M131.4,84.4c-5.3-0.1-11.2,0.8-11.2,5.9c0,3.1,2.1,4.6,4.5,4.6c3.4,0,5.6-2.2,6.4-4.4c0.2-0.5,0.3-1,0.3-1.5V84.4z"/>
//                 <path fill="#FFFFFF" d="M146.6,63.9v7.6h6.9v3.7h-6.9v14.2c0,3.3,0.9,5.1,3.6,5.1c1.3,0,2.2-0.2,2.8-0.3l0.2,3.6 c-0.9,0.4-2.4,0.7-4.3,0.7c-2.2,0-4-0.7-5.2-2c-1.4-1.4-1.9-3.8-1.9-6.9V75.1h-4.1v-3.7h4.1v-6.3L146.6,63.9z"/>
//                 <path fill="#FFFFFF" d="M171.4,97.8l-0.4-3.3h-0.2c-1.5,2.1-4.3,3.9-8.1,3.9c-5.4,0-8.1-3.8-8.1-7.6c0-6.4,5.7-9.9,15.9-9.8v-0.5 c0-2.2-0.6-6.1-6-6.1c-2.5,0-5,0.8-6.9,2l-1.1-3.2c2.2-1.4,5.4-2.3,8.7-2.3c8.1,0,10.1,5.5,10.1,10.8v9.9c0,2.3,0.1,4.5,0.4,6.3 H171.4z M170.7,84.4c-5.3-0.1-11.2,0.8-11.2,5.9c0,3.1,2.1,4.6,4.5,4.6c3.4,0,5.6-2.2,6.4-4.4c0.2-0.5,0.3-1,0.3-1.5V84.4z"/>
//             </g>
//         </g>
//     </svg>
// )
