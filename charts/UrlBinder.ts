// Static utilities to bind the global window URL to a ChartUrl object.

import { reaction, IReactionDisposer } from "mobx"
import {
    setWindowQueryStr,
    queryParamsToStr,
    QueryParams
} from "utils/client/url"

import { debounce } from "./Util"

export interface ObservableUrl {
    params: QueryParams
    debounceMode: boolean
}

export class UrlBinder {
    private disposer?: IReactionDisposer
    bindToWindow(url: ObservableUrl) {
        // There is a surprisingly considerable performance overhead to updating the url
        // while animating, so we debounce to allow e.g. smoother timelines
        const pushParams = () => setWindowQueryStr(queryParamsToStr(url.params))
        const debouncedPushParams = debounce(pushParams, 100)

        this.disposer = reaction(
            () => url.params,
            () => (url.debounceMode ? debouncedPushParams() : pushParams())
        )
    }

    unbindFromWindow() {
        this.disposer!()
    }
}
