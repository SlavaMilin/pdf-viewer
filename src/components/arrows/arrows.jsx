import React from 'react';
import './arrows.scss';

const Arrows = ({onPrevSlideBtnClick, onNextSlideBtnClick, numPages}) => {
  return (
    <section className="arrows">
      <button
        className="arrows__prev"
        type="button"
        onClick={onPrevSlideBtnClick}
        disabled={!numPages}
      >
        Предыдущий слайд
      </button>
      <button
        className="arrows__next"
        type="button"
        onClick={onNextSlideBtnClick}
        disabled={!numPages}
      >
        Следующий слайд
      </button>
    </section>
  );
};

export default Arrows;
