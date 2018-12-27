import React, {Component} from 'react';
import {Document, Page} from 'react-pdf/dist/entry.parcel';

import './second-window.scss';

export default class SecondWindow extends Component {
  state = {
    numPages: null,
    file: null,
    slideWidth: 400,
    pageNumber: 1,
    fitPages: null,
    renderPages: 1
  };

  componentDidMount() {
    window.addEventListener('message', this.onReceiveMessage);
    this.calculateFitPages();
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.onReceiveMessage);
  }

  onDocumentLoadSuccess = (document) => {
    const {numPages} = document;
    const {pageNumber} = this.state;
    const renderPages = this.calculatePreloadPages(pageNumber, numPages);

    this.setState({
      numPages,
      renderPages
    });
  };

  onReceiveMessage = (e) => {
    if (e.data.file) {
      this.setState({
        file: e.data.file
      });
    }

    if (e.data.pageNumber) {
      const pageNumber = e.data.pageNumber;
      const {numPages} = this.state;
      const renderPages = this.calculatePreloadPages(pageNumber, numPages);

      this.setState({
        pageNumber,
        renderPages
      });
    }
  };

  calculateFitPages = () => {
    const pageHeight = (this.state.slideWidth / 16 * 9);
    const windowHeight = window.screen.height;
    const fitPages = Math.ceil(windowHeight / pageHeight);

    this.setState({
      fitPages
    });
  };

  calculatePreloadPages = (pageNumber, numPages) => {
    const {fitPages} = this.state;
    let pagesLeft = numPages - pageNumber;
    let renderPages = 0;

    while(pagesLeft >= 0 && renderPages < fitPages) {
      renderPages++;
      pagesLeft--;
    }

    return renderPages;
  };

  render() {
    const {file, renderPages, pageNumber, slideWidth} = this.state;

    const secondPageStyle = {
      width: slideWidth
    };

    return (
      <Document
        file={file}
        onLoadSuccess={this.onDocumentLoadSuccess}
      >
        <div
          className="second-window"
          style={secondPageStyle}
        >
          {Array.from(
            new Array(renderPages),
            (el, i) => (
              <Page
                key={`page-${pageNumber + i}`}
                pageNumber={pageNumber + i}
                width={slideWidth}
                renderAnnotationLayer={false}
                renderTextLayer={false}
              />
            )
          )}
        </div>
      </Document>
    );
  }

}
