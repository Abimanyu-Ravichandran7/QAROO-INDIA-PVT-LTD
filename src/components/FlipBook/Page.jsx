import React from 'react';

/**
 * One leaf of the flip book.
 *
 * react-pageflip attaches a ref to every page, so this has to be a
 * forwardRef component and the ref has to reach the root div. The library
 * writes position, width, height, display, transform and clip-path onto that
 * root inline, so nothing here or in the stylesheet may set them: all layout
 * belongs to the inner content wrapper.
 *
 * @param {object} props
 * @param {boolean} [props.hard] turns like a stiff board - used for the covers
 */
const Page = React.forwardRef(function Page({ children, className, hard = false }, ref) {
  return (
    <div
      ref={ref}
      className={['flipbook-page', className].filter(Boolean).join(' ')}
      data-density={hard ? 'hard' : 'soft'}
    >
      <div className="flipbook-page__content">{children}</div>
    </div>
  );
});

export default Page;
