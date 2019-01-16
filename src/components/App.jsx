import React, { Component } from "react";
import { Document, Page } from "react-pdf/dist/entry.parcel";
import moment from "moment";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "./App.scss";

const options = {
  cMapUrl: "cmaps/",
  cMapPacked: true
};

export default class App extends Component {
  state = {
    numPages: null,
    secondWindow: null,
    fullScreen: false,
    showStatistic: false,
    isRecord: false,
    inputValue: 1,
    pageNumber: 1,
    currentPreloadCount: 2,
    maxPreload: 2,
    previewSlideWidth: 1200,
    startLectureHours: "19",
    startLectureMinutes: "00",
    file: null,
    pageWidth: window.screen.width,
    savedSlides: {}
  };

  componentDidMount = () => {
    document.addEventListener("keydown", this.onKeyDown);
    document.addEventListener(
      "webkitfullscreenchange",
      this.onFullScreenExit,
      false
    );
  };

  componentWillUnmount = () => {
    document.removeEventListener("keydown", this.onKeyDown);
    document.removeEventListener(
      "webkitfullscreenchange",
      this.onFullScreenExit
    );
  };

  componentDidUpdate = () => {
    const { isRecord, startLectureHours } = this.state;
    const isLectureStart = moment().format("HH") === startLectureHours;

    if (!isRecord && isLectureStart) {
      this.setState({
        isRecord: true
      });
    }
  };

  onDocumentLoadSuccess = document => {
    const { numPages } = document;

    this.setState({
      numPages,
      pageNumber: 1
    });
  };

  onFileChange = e => {
    const file = e.target.files[0];
    const pageNumber = 1;
    const { secondWindow } = this.state;

    if (secondWindow) {
      secondWindow.postMessage({ file }, "*");
      secondWindow.postMessage({ pageNumber }, "*");
    }
    this.setState({
      file,
      pageNumber
    });
  };

  onKeyDown = e => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      this.nextSlide();
    }
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      this.prevSlide();
    }
  };

  onChangePageNumber = e => {
    const inputValue = e.target.value;
    this.setState({
      inputValue
    });
  };

  onSubmitInput = e => {
    const { numPages } = this.state;
    let pageNumber = parseInt(e.target.value, 10);

    if (pageNumber < 1) {
      pageNumber = 1;
    }

    if (pageNumber > numPages) {
      pageNumber = numPages;
    }

    this.changeSlide(pageNumber);
  };

  onPrevSlideBtnClick = () => {
    this.prevSlide();
  };

  onNextSlideBtnClick = () => {
    this.nextSlide();
  };

  onFirstSlideBtnClick = () => {
    this.changeSlide(1);
  };

  onLastSlideBtnClick = () => {
    const { numPages } = this.state;
    this.changeSlide(numPages);
  };

  onFullScreenBtnClick = () => {
    this.setState({
      fullScreen: true
    });

    this.slidesWrap.webkitRequestFullscreen();
  };

  onFullScreenExit = () => {
    if (!document.webkitIsFullScreen) {
      this.setState({
        fullScreen: false
      });
    }
  };

  onSecondWindowClick = () => {
    const { file, pageNumber } = this.state;
    const secondWindow = window.open("./inner", "secondWindow");

    if (file) {
      setTimeout(() => {
        secondWindow.postMessage({ file }, "*");
        secondWindow.postMessage({ pageNumber }, "*");
      }, 2000);
    }

    this.setState({
      secondWindow
    });
  };

  onSyncBtnClick = () => {
    const { pageNumber, secondWindow } = this.state;

    if (secondWindow) {
      secondWindow.postMessage({ pageNumber }, "*");
    }
  };

  onSlideTitleChange = e => {
    const { savedSlides, pageNumber } = this.state;

    savedSlides[pageNumber] = {
      title: e.target.value,
      time: []
    };

    this.setState({
      savedSlides
    });
  };

  onShowStatisticClick = () => {
    this.setState(prevState => ({
      showStatistic: !prevState.showStatistic
    }));
  };

  onStartRecordClick = () => {
    this.setState(prevState => ({
      isRecord: !prevState.isRecord
    }));
  };

  onStartLectureHoursChange = e => {
    this.setState({
      startLectureHours: e.target.value
    });
  };

  onStartLectureMinutesChange = e => {
    this.setState({
      startLectureMinutes: e.target.value
    });
  };

  onDelTimecodeClick = e => {
    const savedSlides = { ...this.state.savedSlides };
    delete savedSlides[e.target.dataset.index];

    this.setState({
      savedSlides
    });
  };

  nextSlide = () => {
    const { pageNumber } = this.state;
    this.changeSlide(pageNumber + 1);
  };

  prevSlide = () => {
    const { pageNumber } = this.state;
    this.changeSlide(pageNumber - 1);
  };

  changeSlide = pageNumber => {
    pageNumber = parseInt(pageNumber, 10);
    const { numPages, maxPreload, secondWindow } = this.state;

    if (pageNumber < 1 || pageNumber > numPages) {
      return null;
    }

    let currentPreloadCount = maxPreload;

    if (pageNumber + maxPreload > numPages) {
      currentPreloadCount = numPages - pageNumber + 1;
    }

    if (secondWindow) {
      secondWindow.postMessage({ pageNumber }, "*");
    }

    this.recordSlideTime(pageNumber);

    this.setState({
      pageNumber,
      currentPreloadCount,
      inputValue: pageNumber
    });
  };

  getTimeCode = () => {
    const { startLectureHours, startLectureMinutes } = this.state;

    const startLecture = moment(
      `${startLectureHours}:${startLectureMinutes}:00`,
      "HH:mm:ss"
    );

    return moment.utc(moment().diff(startLecture)).format("HH:mm:ss");
  };

  recordSlideTime = pageNumber => {
    const { savedSlides, isRecord } = this.state;

    if (isRecord && pageNumber in savedSlides) {
      savedSlides[pageNumber].time.push(this.getTimeCode());
      this.setState({
        savedSlides
      });
    }
  };

  render() {
    const {
      pageNumber,
      numPages,
      file,
      previewSlideWidth,
      pageWidth,
      currentPreloadCount,
      inputValue,
      fullScreen,
      startLectureHours,
      startLectureMinutes,
      savedSlides,
      showStatistic,
      isRecord,
      secondWindow
    } = this.state;
    const sliderWidth = fullScreen ? pageWidth : previewSlideWidth;

    const slidesTimeItems = () => {
      return Object.keys(savedSlides).map(it => {
        return (
          <div key={`timecode-${it}`}>
            <button
              className="saved-slides__btn"
              type="button"
              data-index={it}
              onClick={this.onDelTimecodeClick}
            >
              {}
            </button>
            <span>
              {savedSlides[it].time.join(", ")}#{savedSlides[it].title}
            </span>
          </div>
        );
      });
    };

    return (
      <div>
        <header className="header">
          <section className="container header__inner">
            <section className="header__controls controls">
              <input
                className="controls__input"
                type="file"
                id="controls__upload-btn"
                onChange={this.onFileChange}
                hidden
              />
              <label className="controls__label" htmlFor="controls__upload-btn">
                Загрузить PDF
              </label>

              <button
                className="controls__window-btn"
                type="button"
                onClick={this.onSecondWindowClick}
                disabled={!numPages}
              >
                Второе окно
              </button>
              <button
                className="controls__sync-btn"
                type="button"
                onClick={this.onSyncBtnClick}
                disabled={!secondWindow}
              >
                Синхр. окна
              </button>
            </section>

            <section className="header__arrows arrows">
              <button
                className="arrows__first"
                type="button"
                onClick={this.onFirstSlideBtnClick}
                disabled={!numPages}
              >
                Первый слайд
              </button>

              <button
                className="arrows__prev"
                type="button"
                onClick={this.onPrevSlideBtnClick}
                disabled={!numPages}
              >
                Предыдущий слайд
              </button>

              <div className="arrows__numbers-inner">
                <input
                  className="arrows__value"
                  type="text"
                  value={inputValue}
                  onChange={this.onChangePageNumber}
                  onBlur={this.onSubmitInput}
                  disabled={!numPages}
                />
                <span className="arrows__slash"> / </span>
                <input
                  className="arrows__value"
                  value={numPages || "0"}
                  type="text"
                  disabled
                />
              </div>

              <button
                className="arrows__next"
                type="button"
                onClick={this.onNextSlideBtnClick}
                disabled={!numPages}
              >
                Следующий слайд
              </button>

              <button
                className="arrows__last"
                type="button"
                onClick={this.onLastSlideBtnClick}
                disabled={!numPages}
              >
                Последний слайд
              </button>
            </section>

            <div className="header__lecture">
              <section className="lecture">
                <span>Старт лекции: </span>
                <select
                  onChange={this.onStartLectureHoursChange}
                  value={parseInt(startLectureHours)}
                >
                  {Array.from(new Array(24), (it, i) => (
                    <option key={`${i}-hours`} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
                <span> : </span>
                <select
                  onChange={this.onStartLectureMinutesChange}
                  value={startLectureMinutes}
                >
                  {Array.from(new Array(60), (it, i) => {
                    i = i < 10 ? `0${i}` : i;
                    return (
                      <option key={`${i}-minutes`} value={i}>
                        {i}
                      </option>
                    );
                  })}
                </select>
                <button
                  className={`lecture__btn ${
                    isRecord ? "lecture__btn--rec-on" : ""
                  }`}
                  type="button"
                  onClick={this.onStartRecordClick}
                >
                  rec: {isRecord ? "on" : "off"}
                </button>
              </section>

              <section className="slide-title">
                <input
                  className="slide-title__input"
                  type="text"
                  placeholder="Заголовок слайда"
                  value={
                    savedSlides[pageNumber] ? savedSlides[pageNumber].title : ""
                  }
                  onChange={this.onSlideTitleChange}
                  disabled={!numPages}
                />

                <button
                  className={`slide-title__statistic-toggle ${
                    showStatistic
                      ? "slide-title__statistic-toggle--active"
                      : null
                  }`}
                  type="button"
                  onClick={this.onShowStatisticClick}
                >
                  Показать/скрыть статистику
                </button>
              </section>
            </div>

            <section className="header__fullscreen fullscreen">
              <button
                className="fullscreen__btn"
                type="button"
                onClick={this.onFullScreenBtnClick}
                disabled={!numPages}
              >
                fullscreen
              </button>
            </section>
          </section>

          <section className="saved-slides container" hidden={!showStatistic}>
            <h3>Выбранные слайды</h3>
            {Object.keys(savedSlides).length ? (
              slidesTimeItems()
            ) : (
              <div>Ни один слайд пока не сохранён...</div>
            )}
          </section>
        </header>

        <main className="slider container">
          <div className="slider__wrap" style={{ width: sliderWidth }}>
            <Document
              file={file}
              onLoadSuccess={this.onDocumentLoadSuccess}
              options={options}
              externalLinkTarget={"_blank"}
              className={"main-slide"}
              inputRef={ref => (this.slidesWrap = ref)}
            >
              {Array.from(new Array(currentPreloadCount), (el, i) => (
                <Page
                  key={`page-${pageNumber + i}`}
                  pageNumber={pageNumber + i}
                  width={sliderWidth}
                />
              ))}
            </Document>
          </div>
        </main>
      </div>
    );
  }
}
