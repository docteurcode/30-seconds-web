import React from 'react';
import PropTypes from 'typedefs/proptypes';
import { useClickOutside } from 'components/hooks';
import settings from 'settings/global';
import literals from 'lang/en/client/developer';
// Do not change this to `import`, it's not going to work, no clue why
// Also do not move this to the general styles, as we want to keep it separate
// and not serve it in production.
require('./index.scss');

const propTypes = {
  pageContext: PropTypes.shape({
    snippet: PropTypes.snippet,
  }),
};

/**
 * Renders a floating button with development controls.
 */
const DevelopmentControls = ({ pageContext: { snippet } = {} }) => {
  const [opened, setOpened] = React.useState(false);
  const [coverImage, setCoverImage] = React.useState();
  const controlsRef = React.useRef();

  useClickOutside(controlsRef, () => {
    setOpened(false);
  });

  React.useEffect(() => {
    setCoverImage(
      typeof document !== 'undefined' &&
        document.querySelector('.card-cover-image')
    );
  });

  return (
    <div
      className='floating-controls-container flex flex-col srfc-05db br-xl'
      ref={controlsRef}
    >
      {opened ? (
        <>
          <a href='/developer' className='btn btn-dev no-shd link-btn'>
            {literals.contentManager}
          </a>
          {snippet ? (
            <a
              className='btn btn-dev no-shd link-btn fs-sm'
              href={snippet.vscodeUrl}
              rel='nofollow noopener noreferrer'
              target='_blank'
            >
              {literals.openInVscode}
            </a>
          ) : null}
          {coverImage ? (
            <button
              className='btn btn-dev no-shd link-btn fs-sm'
              onClick={() => {
                const img = prompt('Cover image URL', coverImage.src);
                coverImage.src = img;
              }}
            >
              {literals.editCoverImage}
            </button>
          ) : null}
          <a
            className='btn btn-dev no-shd link-btn fs-sm'
            href={`${location.origin}/page-data${location.pathname}page-data.json`}
            target='_blank'
            rel='noopener noreferrer'
          >
            {literals.viewJSON}
          </a>
          <a
            className='btn btn-dev no-shd link-btn fs-sm'
            href={`${settings.websiteUrl}${location.pathname}`}
            target='_blank'
            rel='noopener noreferrer'
          >
            {literals.viewLive}
          </a>
        </>
      ) : null}
      <button
        className='btn btn-dev-controls icon icon-deduck'
        title={literals.developerControls}
        onClick={() => {
          setOpened(!opened);
        }}
      ></button>
    </div>
  );
};

DevelopmentControls.propTypes = propTypes;

export default DevelopmentControls;
