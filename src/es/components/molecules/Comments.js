// @ts-check

/* global CustomEvent */
/* global HTMLElement */

/**
 * https://github.com/Weedshaker/event-driven-web-components-realworld-example-app/blob/master/FRONTEND_INSTRUCTIONS.md#home
 * As a molecule, this component shall hold Atoms
 *
 * @export
 * @class Comments
 */
export default class Comments extends HTMLElement {
  constructor () {
    super()

    this.commentsListener = event => this.render(event.detail.fetch)
  }

  connectedCallback () {
    // listen for comments
    document.body.addEventListener('comments', this.commentsListener)
    // on every connect it will attempt to get newest comments
    this.dispatchEvent(new CustomEvent('getComments', {
      bubbles: true,
      cancelable: true,
      composed: true
    }))
    if (this.shouldComponentRender()) this.render(null)
  }

  disconnectedCallback () {
    document.body.removeEventListener('comments', this.commentsListener)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRender () {
    return !this.innerHTML
  }

  /**
   * renders each received comment
   *
   * @param {Promise<{article: import("../../helpers/Interfaces.js").MultipleComments}> | null} fetchComments
   * @return {void}
   */
  render (fetchComments) {
    this.innerHTML = /* html */ `
      <form class="card comment-form">
        <div class="card-block">
          <textarea class="form-control" placeholder="Write a comment..." rows="3"></textarea>
        </div>
        <div class="card-footer">
          <img src="${this.getAttribute('user-image') || ''}" class="comment-author-img" />
          <button class="btn btn-sm btn-primary">
          Post Comment
          </button>
        </div>
      </form>
    `
    fetchComments && fetchComments.then(({comments}) => {
      console.log(comments);
      this.innerHTML += comments.reduce((commentsStr, comment) => (commentsStr += /* html */`
        <div class="card">
          <div class="card-block">
            <p class="card-text">${comment.body}</p>
          </div>
          <div class="card-footer">
            <a href="" class="comment-author">
              <img src="${comment.author.image}" class="comment-author-img" />
            </a>
            &nbsp;
            <a href="#/profile/${comment.author.username}" class="comment-author">${comment.author.username}</a>
            <span class="date-posted">${new Date(comment.createdAt).toDateString()}</span>
            ${comment.author.username === this.getAttribute('user-name') ? '<span class="mod-options"><i class="ion-trash-a"></i></span>' : ''}
          </div>
        </div>
      `), '')
    })
  }

  /**
   * fetch children when first needed
   *
   * @returns {Promise<[string, CustomElementConstructor][]>}
   */
  loadChildComponents () {
    return this.childComponentsPromise || (this.childComponentsPromise = Promise.all([
      import('../controllers/Comments').then(
        /** @returns {[string, CustomElementConstructor]} */
        module => ['c-comments', module.default]
      )
    ]).then(elements => {
      elements.forEach(element => {
        // don't define already existing customElements
        // @ts-ignore
        if (!customElements.get(element[0])) customElements.define(...element)
      })
      return elements
    }))
  }
}
