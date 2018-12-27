import React from 'react';

const UploadBtn = ({onFileChange}) => {
  return (
    <section>
      <input
        className="header__upload-btn"
        type="file"
        id="header__upload-btn"
        onChange={onFileChange}
        hidden
      />
      <label
        className=""
        htmlFor="header__upload-btn"
      >
        Загрузить презентацию
      </label>
    </section>
  );
};

export default UploadBtn;
