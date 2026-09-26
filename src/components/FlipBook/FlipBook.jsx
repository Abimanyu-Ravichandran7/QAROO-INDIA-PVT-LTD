import React from 'react';
import HTMLFlipBook from 'react-pageflip';
import useMediaQuery from '../../hooks/useMediaQuery';
import './FlipBook.css';

/**
 * A page-turning book. Pages are passed as children and must each be the
 * Page component in this folder, as direct children - react-pageflip reads
 * the children list to build the book, so a fragment or wrapper in between
 * breaks it.
 *
 * The ref is forwarded, so a parent can drive it with
 * `ref.current.pageFlip().flipNext()` / `.flipPrev()`, and `onFlip` reports
 * the leaf now showing - between them a parent can render its own controls
 * and say where the reader is, which a book with no visible affordance
 * otherwise leaves the reader to guess.
 */
const FlipBook = React.forwardRef(function FlipBook(
  { children, className, onFlip, label = 'Flip book' },
  ref
) {
  // The turn is user-initiated, so it is not the kind of motion that has to be
  // removed outright - but it is shortened to near-instant for anyone who has
  // asked for less of it.
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return (
    <div
      className={['flipbook', className].filter(Boolean).join(' ')}
      role="group"
      aria-label={label}
    >
      <div className="flipbook__stage">
        <HTMLFlipBook
          ref={ref}
          className="flipbook__book"
          width={500}
          height={600}
          /* 500x600 where there is room, scaled down by the library on a
             narrower screen. `size="fixed"` cannot shrink, so a 500px page
             would force horizontal scroll on a phone; scaling it with a CSS
             transform instead would desynchronise the drag maths from what is
             on screen, because the library measures the real DOM. Stretch
             keeps the ratio and keeps dragging accurate. */
          size="stretch"
          minWidth={280}
          maxWidth={500}
          minHeight={336}
          maxHeight={600}
          drawShadow={true}
          /* The library's own default is 1000ms, which reads as sluggish: the
             page hangs mid-turn and the shadow sits still with it. 750 keeps
             the weight of a real page without the wait. */
          flippingTime={reducedMotion ? 300 : 750}
          usePortrait={true}
          startZIndex={0}
          autoSize={true}
          /* Default is 1 - a hard black gradient sweeping the leaf. Halving it
             turns the same animation into a soft fold, which is most of what
             makes the turn look smooth rather than harsh. */
          maxShadowOpacity={0.5}
          showCover={true}
          mobileScrollSupport={true}
          /* Below here the values match the library's defaults; they are set
             explicitly because the interaction depends on them. Forwarding
             click events is what lets the links inside a page be clicked
             instead of turning the leaf, and the corner fold on hover is what
             tells a reader the book can be dragged at all. */
          clickEventForward={true}
          useMouseEvents={true}
          showPageCorners={true}
          disableFlipByClick={false}
          /* 30px of travel before a swipe counts; a little less is more
             responsive on touch without picking up vertical scrolls. */
          swipeDistance={24}
          onFlip={onFlip}
        >
          {children}
        </HTMLFlipBook>
      </div>
    </div>
  );
});

export default FlipBook;
