import React from 'react';
import './arrows.scss';

const Arrows = ({onPrevSlideBtnClick, onNextSlideBtnClick}) => {
  return (
    <section className="arrows">
      <button
        className="arrows__prev"
        type="button"
        onClick={onPrevSlideBtnClick}
      >
        Предыдущий слайд
      </button>
      <button
        className="arrows__next"
        type="button"
        onClick={onNextSlideBtnClick}
      >
        Следующий слайд
      </button>
    </section>
  );
};

export default Arrows;
