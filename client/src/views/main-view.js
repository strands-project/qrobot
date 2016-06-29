var $ = require('jquery')
var app = require('ampersand-app')
var AmpersandView = require('ampersand-view')
var AmpersandViewSwitcher = require('ampersand-view-switcher')
var links = require('local-links')

var Modal = require('app/components/modal')

module.exports = AmpersandView.extend({
  template: '<div class="container-fluid" data-hook="page"></div>',
  autoRender: true,

  events: {
    'click a[href]': 'handleLinkClicked'
  },

  initialize: function initialize () {
    this.listenTo(app, 'newPage', this.updatePage)
  },

  render: function render () {
    this.renderWithTemplate(this)
    document.body.appendChild(this.el)
    this.pageSwitcher = new AmpersandViewSwitcher(this.queryByHook('page'))
    this.modal = new Modal.View({ backdrop: 'static', keyboard: false })
    document.body.appendChild(this.modal.el)
    return this
  },

  /* Internal function, triggered on the 'newPage' event. Sets the current page
   * and executes an action on it, if needed. */
  updatePage: function updatePage (page, action) {
    if (typeof page.pageTitle === 'string') {
      document.title = page.pageTitle
    }
    page.once('change:rendered', function () {
      $('[autofocus]').focus()
      if (action) {
        var fn = page[action]
        if (typeof fn === 'function') {
          fn.apply(page)
        }
      }
    })
    this.pageSwitcher.set(page)
    this.currentPage = page
  },

  handleLinkClicked: function handleLinkClicked (event) {
    var localPathname = links.pathname(event)
    if (localPathname) {
      event.preventDefault()
      app.navigate(localPathname)
    } else if (links.hash(event)) {
      this.handleHashLinkClicked(event)
    }
  },

  /* When a hash link is clicked and the current page has a function with the
   * same name, it will be executed and event propagation will be stopped. */
  handleHashLinkClicked: function handleHashLinkClicked (event) {
    var action = links.hash(event).substring(1)
    if (action) {
      var fn = this.currentPage[action]
      if (typeof fn === 'function') {
        event.preventDefault()
        fn.apply(this.currentPage)
      }
    }
  }
})
