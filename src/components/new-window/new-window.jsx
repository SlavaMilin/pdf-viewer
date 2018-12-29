import React from 'react';
import './new-window.scss';

const NewWindow = ({onSecondWindowClick, onSyncBtnClick, numPages, secondWindow}) => {
  return (
    <section className="new-window">
      <button
        className="new-window__window-btn"
        type="button"
        onClick={onSecondWindowClick}
        disabled={!numPages}
      >
        Второе окно
      </button>
      <button
        className="new-window__sync-btn"
        type="button"
        onClick={onSyncBtnClick}
        disabled={secondWindow}
      >
        Синхр. окна
      </button>
    </section>
  );
};

export default NewWindow;
