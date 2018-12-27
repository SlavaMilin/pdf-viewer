import React from 'react';
import './upload-btn.scss';

const UploadBtn = ({onFileChange}) => {
  return (
    <section className="upload-btn">
      <input
        className="upload-btn__input"
        type="file"
        id="header__upload-btn"
        onChange={onFileChange}
        hidden
      />
      <label
        className="upload-btn__label"
        htmlFor="header__upload-btn"
      >
        Загрузить PDF
      </label>
    </section>
  );
};

export default UploadBtn;
