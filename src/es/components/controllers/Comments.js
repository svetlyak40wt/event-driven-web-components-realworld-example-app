// @ts-check

/* global HTMLElement */
/* global AbortController */
/* global CustomEvent */
/* global fetch */

/**
 * https://github.com/gothinkster/realworld/tree/master/api#add-comments-to-an-article
 *
 * @typedef {{
      fetch: Promise<import("../../helpers/Interfaces.js").MultipleTags>
    }} TagsEventDetail
 */

import { Environment } from '../../helpers/Environment.js'

/**
 * https://github.com/gothinkster/realworld/tree/master/api#add-comments-to-an-article
 * As a controller, this component becomes a store and organizes events
 * dispatches: 'getComments' on 'Comments'
 *
 * @export
 * @class Comments
 */
export default class Comments extends HTMLElement {
  constructor () {
    super()

    /**
     * Used to cancel ongoing, older fetches
     * this makes sense, if you only expect one and most recent true result and not multiple
     *
     * @type {AbortController | null}
     */
    this.abortController = null

    /**
     * Listens to the event name/typeArg: 'Comments'
     *
     * @param {CustomEvent} event
     */
    this.commentsListener = event => {
      // if no slug is sent, we grab it here from the location, this logic could also be handle through an event at the router
      const slug = event.detail && event.detail.slug || Environment.slug || ''
      const url = `${Environment.fetchBaseUrl}articles/${slug}/comments`
      // reset old AbortController and assign new one
      if (this.abortController) this.abortController.abort()
      this.abortController = new AbortController()
      // answer with event
      this.dispatchEvent(new CustomEvent('comments', {
        /** @type {TagsEventDetail} */
        detail: {
          fetch: fetch(url, {
            signal: this.abortController.signal,
            ...Environment.fetchHeaders
          }).then(response => {
            if (response.status >= 200 && response.status <= 299) return response.json()
            throw new Error(response.statusText)
          // @ts-ignore
          })
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }))
    }
  }

  connectedCallback () {
    this.addEventListener('getComments', this.commentsListener)
  }

  disconnectedCallback () {
    this.removeEventListener('getComments', this.commentsListener)
  }
}
