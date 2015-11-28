var React = require('react');
var mixins = require('baobab-react/mixins');
var Modal = require('react-bootstrap/lib/Modal');
var PureRenderMixin = require('react-addons-pure-render-mixin');
var i18n = require('i18next-client');

var actions = require('../../actions');

module.exports = React.createClass({
  displayName: 'FAQ',
  mixins: [
    mixins.branch,
    PureRenderMixin,
  ],
  cursors: {
    lng: ['lng'],
  },
  props: {
    show: React.PropTypes.bool.isRequired,
    onHide: React.PropTypes.func.isRequired,
  },

  donate: function() {
    this.props.onHide();
    actions.openModal('donate');
  },

  render: function() {
    return (
      <Modal show={this.props.show} onHide={this.props.onHide}>
        <Modal.Header closeButton>
          <Modal.Title>{i18n.t('FAQ')}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <h4>{i18n.t('What is this site?')}</h4>
          <div>
            {i18n.t('This site is an unofficial app browser for Ubuntu Touch apps. All data for the apps comes from a publicly accessible api. This site is maintained by Brian Douglass and is not endorsed by or affiliated with Ubuntu or Canonical. Ubuntu and Canonical are registered trademarks of Canonical Ltd.')}
            <br/>
            <br/>
            <a href="https://wiki.ubuntu.com/AppStore/Interfaces/ClickPackageIndex">
              API <i className="fa fa-external-link"></i>
            </a>
            <br/>
            <a href="http://www.canonical.com/">
              Canonical Ltd. <i className="fa fa-external-link"></i>
            </a>
          </div>
          <br/>

          <h4>{i18n.t('How do I install apps?')}</h4>
          <div>
            <p>
              {i18n.t('To install an app, visit this site on your Ubuntu Touch device. Find the app that you wish to install and click the "Install" button. You will then be taken to the official appstore on your device where you can install the app.')}
            </p>
            <p>{i18n.t('Apps are not installed via this site, but via the official appstore.')}</p>
          </div>
          <br/>

          <h4>{i18n.t('What is the star rating?')}</h4>
          <div>
            {i18n.t('The star rating is the Bayesian average of the star ratings that user give to an app when they leave a review. The Bayesian average allows apps with more reviews to rank better than apps with less reviews. The star rating can be between 1 and 5, where a 0 means that there have not been any reviews yet. For more information about the Bayesian average calculation, check out this article.')}
            <br/>
            <br/>
            <a href="http://fulmicoton.com/posts/bayesian_rating/">
              {i18n.t('Article')} <i className="fa fa-external-link"></i>
            </a>
          </div>
          <br/>

          <h4>{i18n.t('What is the heart rating?')}</h4>
          <div>
            <p>
              {i18n.t('The heart rating is similar to the star rating, but it rewards apps for having more good reviews. An app with more 5 star ratings will have a higher heart rating than an app with only a few 5 star ratings.')}
            </p>
            <p>
              {i18n.t('Heart ratings are calculated from the star rating where a 5 star review is 1 heart point, 4 stars = 0.5 hearts, 3 stars = 0 hearts, 2 stars = -0.5 hearts, and 1 star = -1 hearts.')}
            </p>
            <p>{i18n.t('It is possible to have a negative heart rating.')}</p>
          </div>
          <br/>

          <h4>{i18n.t('How is the popularity determined?')}</h4>
          <div>
            <p>
              {i18n.t('Popularity is based on the number of 4 and 5 star reviews given to and app during the current month.')}
            </p>
          </div>
          <br/>

          <h4>{i18n.t("I just published my app, why don't I see it?")}</h4>
          <div>
            <a href="/apps/request" onClick={this.props.onHide}>
              {i18n.t('New apps are fetched from the official appstore every hour, you can either wait until the new apps are fetched or use the request form to request that the app be found early.')}
            </a>
          </div>

          <h4>{i18n.t('What do I do if I find copyright or trademark infringing content?')}</h4>
          <div>
            {i18n.t("Any requests to remove copyright or trademark infringing content should be taken up with Canonical or the app's author (an author usually has a method of contact listed under the Support tab on their app's page). uApp Explorer is not affiliated with Canonical and does not host any apps. uApp Explorer only displays publicly available information about the official Ubuntu Touch appstore.")}
            <br/>
            <br/>
            <a href="http://www.canonical.com/">Canonical <i className="fa fa-external-link"></i></a>
          </div>

          <h4>{i18n.t('Where can I report a problem or request a new feature?')}</h4>
          <div>
            <a href="https://github.com/bhdouglass/uappexplorer/issues">
              {i18n.t('To report a problem or request a new feature visit the issues page for this site on GitHub.')}
            </a>
          </div>
          <br/>

          <h4>{i18n.t('How can I help improve this site?')}</h4>
          <div>
            <a href="https://github.com/bhdouglass/uappexplorer">
              {i18n.t('If you want to contribute code visit the GitHub repo.')}
            </a>
            <br/>
            <a href="https://github.com/bhdouglass/uappexplorer/issues">
              {i18n.t('If you want to submit bugs or feature requests visit the GitHub issues page.')}
            </a>
            <br/>
            <a href="https://translations.launchpad.net/uappexplorer">
              {i18n.t('If you want to help translate, visit the Launchpad project.')}
            </a>
            <br/>
            <a onClick={this.donate} className="clickable">
              {i18n.t('If you would like to contribute monetarily, there are multiple options for donating.')}
            </a>
            <br/>
            <a href="http://bhdouglass.com/">
              {i18n.t('If you would like to contact the author, visit his website.')}
            </a>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <a className="btn btn-info" onClick={this.props.onHide}>{i18n.t('Close')}</a>
        </Modal.Footer>
      </Modal>
    );
  }
});
