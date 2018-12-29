import React from 'react';
import './new-window.scss';

const NewWindow = ({onSecondWindowClick, onSyncBtnClick}) => {
  return (
    <section className="new-window">
      <button
        className="new-window__window-btn"
        type="button"
        onClick={onSecondWindowClick}
      >
        Второе окно
      </button>
      <button
        className="new-window__sync-btn"
        type="button"
        onClick={onSyncBtnClick}
      >
        Синхр. окна
      </button>
    </section>
  );
};

export default NewWindow;
