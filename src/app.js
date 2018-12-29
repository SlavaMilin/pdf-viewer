import React, {Component} from 'react';
import {Document, Page} from 'react-pdf/dist/entry.parcel';
import moment from 'moment';

import UploadBtn from './components/upload-btn/upload-btn';
import NewWindow from './components/new-window/new-window';
import Arrows from './components/arrows/arrows';

import 'react-pdf/dist/Page/AnnotationLayer.css';
import './app.scss';

import samplePDF from './samplePDF.pdf';

const options = {
  cMapUrl: 'cmaps/',
  cMapPacked: true,
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
    startLectureHours: '19',
    startLectureMinutes: '00',
    file: samplePDF,
    pageWidth: window.screen.width,
    savedSlides: {},
  };

  componentDidMount = () => {
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('webkitfullscreenchange', this.onFullScreenExit, false);
  };

  componentWillUnmount = () => {
    document.removeEventListener('keydown', this.onKeyDown);
    document.removeEventListener('webkitfullscreenchange', this.onFullScreenExit);
  };


  onDocumentLoadSuccess = (document) => {
    const {numPages} = document;

    this.setState({
      numPages,
      pageNumber: 1,
    });
  };

  onFileChange = (e) => {
    const file = e.target.files[0];
    const pageNumber = 1;
    const {secondWindow} = this.state;

    if (secondWindow) {
      secondWindow.postMessage({file}, '*');
      secondWindow.postMessage({pageNumber}, '*');
    }
    this.setState({
      file,
      pageNumber
    });
  };

  onKeyDown = (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      this.nextSlide();
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      this.prevSlide();
    }
  };

  onChangePageNumber = (e) => {
    const inputValue = e.target.value;
    this.setState({
      inputValue
    });
  };

  onSubmitInput = (e) => {
    const {numPages} = this.state;
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
    const {numPages} = this.state;
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
    const {file, pageNumber} = this.state;
    const secondWindow = window.open('./inner.html', 'secondWindow');

    if (file) {
      setTimeout(() => {
        secondWindow.postMessage({file}, '*');
        secondWindow.postMessage({pageNumber}, '*');
      }, 2000);
    }

    this.setState({
      secondWindow
    });
  };

  onSyncBtnClick = () => {
    const {pageNumber, secondWindow} = this.state;

    if (secondWindow) {
      secondWindow.postMessage({pageNumber}, '*');
    }
  };

  onSlideTitleChange = (e) => {
    const {savedSlides, pageNumber} = this.state;

    savedSlides[pageNumber] = {
      title: e.target.value,
      time: []
    };

    this.setState({
      savedSlides
    });
  };

  onShowStatisticClick = () => {
    this.setState((prevState) => ({
      showStatistic: !prevState.showStatistic
    }));
  };

  onStartRecordClick = () => {
    this.setState((prevState) => ({
      isRecord: !prevState.isRecord
    }));
  };

  onStartLectureHoursChange = (e) => {
    this.setState({
      startLectureHours: e.target.value,
    });
  };

  onStartLectureMinutesChange = (e) => {
    this.setState({
      startLectureMinutes: e.target.value,
    });
  };

  onDelTimecodeClick = (e) => {
    const savedSlides = {...this.state.savedSlides};
    delete savedSlides[e.target.dataset.index];

    this.setState({
      savedSlides
    });
  };

  nextSlide = () => {
    const {pageNumber} = this.state;
    this.changeSlide(pageNumber + 1);
  };

  prevSlide = () => {
    const {pageNumber} = this.state;
    this.changeSlide(pageNumber - 1);
  };

  changeSlide = (pageNumber) => {
    pageNumber = parseInt(pageNumber, 10);
    const {numPages, maxPreload, secondWindow} = this.state;

    if (pageNumber < 1 || pageNumber > numPages) {
      return null;
    }

    let currentPreloadCount = maxPreload;

    if (pageNumber + maxPreload > numPages) {
      currentPreloadCount = numPages - pageNumber + 1;
    }

    if (secondWindow) {
      secondWindow.postMessage({pageNumber}, '*');
    }

    this.recordSlideTime(pageNumber);

    this.setState({
      pageNumber,
      currentPreloadCount,
      inputValue: pageNumber
    });
  };

  getTimeCode = () => {
    const {startLectureHours, startLectureMinutes} = this.state;

    const startLecture = moment(`${startLectureHours}:${startLectureMinutes}:00`, 'HH:mm:ss');

    return moment.utc(moment().diff(startLecture)).format('HH:mm:ss');
  };

  recordSlideTime = (pageNumber) => {
    const {savedSlides, isRecord} = this.state;

    if (isRecord && pageNumber in savedSlides) {
      savedSlides[pageNumber].time.push(this.getTimeCode());
      this.setState({
        savedSlides
      });
    }
  };

  render() {
    const {
      pageNumber, numPages, file, previewSlideWidth, pageWidth, currentPreloadCount, inputValue, fullScreen, startLectureHours, startLectureMinutes, savedSlides, showStatistic, isRecord
    } = this.state;
    const sliderWidth = fullScreen ? pageWidth : previewSlideWidth;

    const slidesTimeItems = () => {
      return (
        Object.keys(savedSlides).map((it) => {
          return (
            <div key={`timecode-${it}`}>
              <button
                type="button"
                data-index={it}
                onClick={this.onDelTimecodeClick}
              >
                {}
              </button>
              <span>
                {savedSlides[it].time.join(', ')}#{savedSlides[it].title}
              </span>
            </div>
          );
        })
      );
    };

    return (
      <div>
        <header className="header">
          <section className="container header__inner">

            <div className="header__upload-btn">
              <UploadBtn onFileChange={this.onFileChange} />
            </div>

            <div className="header__new-window">
              <NewWindow
                onSecondWindowClick={this.onSecondWindowClick}
                onSyncBtnClick={this.onSyncBtnClick}
              />
            </div>

            <div className="header__arrows">
              <Arrows
                onPrevSlideBtnClick={this.onPrevSlideBtnClick}
                onNextSlideBtnClick={this.onNextSlideBtnClick}
              />
            </div>

            <section>
              <button
                type="button"
                onClick={this.onFirstSlideBtnClick}
              >
                Первый слайд
              </button>
              <button
                type="button"
                onClick={this.onLastSlideBtnClick}
              >
                Последний слайд
              </button>
            </section>

            <section>
              <input
                type="number"
                min="1"
                max={numPages}
                value={inputValue}
                onChange={this.onChangePageNumber}
                onBlur={this.onSubmitInput}
                disabled={!numPages}
              />
              из
              <input
                type="test"
                value={numPages || '-'}
                disabled
              />
            </section>

            <section>
              <button
                type="button"
                onClick={this.onFullScreenBtnClick}
              >
                fullscreen
              </button>
            </section>

            <section>
              <span>Старт лекции: </span>
              <select onChange={this.onStartLectureHoursChange}>
                {Array.from(new Array(24), (it, i) => (
                  <option key={`${i}-hours`} value={i} selected={i === parseInt(startLectureHours)}>{i}</option>
                ))}
              </select>
              <span> : </span>
              <select onChange={this.onStartLectureMinutesChange}>
                {Array.from(new Array(60), (it, i) => {
                  i = i < 10 ? `0${i}` : i;
                  return (
                    <option
                      key={`${i}-minutes`}
                      value={i}
                      selected={parseInt(i) === parseInt(startLectureMinutes)}
                    >
                      {i}
                    </option>
                  );
                })}
              </select>
              <button
                type="button"
                onClick={this.onStartRecordClick}
              >
                {isRecord ? 'Выключить' : 'Включить'} запись таймингов
              </button>
            </section>

            <section>
              <button type="button">Запомнить слайд</button>
              <input
                type="text"
                placeholder="Заголовок слайда"
                value={savedSlides[pageNumber] ? savedSlides[pageNumber].title : ''}
                onChange={this.onSlideTitleChange}
              />
              <button
                type="button"
              >
                Сохранить слайды
              </button>

              <button
                type="button"
                onClick={this.onShowStatisticClick}
              >
                {showStatistic ? 'Скрыть статистику' : 'Показать статистику'}
              </button>
            </section>

          </section>

          <section
            className="saved-slides container"
            hidden={!showStatistic}
          >
            <h3>Выбранные слайды</h3>
            {Object.keys(savedSlides).length ? slidesTimeItems() : <div>Ни один слайд пока не сохранён...</div>}
          </section>

        </header>

        <main className="slider container">
          <div
            className="slider__wrap"
            style={{width: sliderWidth}}
          >
            <Document
              file={file}
              onLoadSuccess={this.onDocumentLoadSuccess}
              options={options}
              externalLinkTarget={'_blank'}
              className={'main-slide'}
              inputRef={ref => this.slidesWrap = ref}
            >
              {Array.from(
                new Array(currentPreloadCount),
                (el, i) => (
                  <Page
                    key={`page-${pageNumber + i}`}
                    pageNumber={pageNumber + i}
                    width={sliderWidth}
                  />
                )
              )}
            </Document>
          </div>
        </main>
      </div>
    );
  }
}
