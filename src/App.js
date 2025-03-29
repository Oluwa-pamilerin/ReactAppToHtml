import React, { useState } from "react";
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.6.172/pdf.worker.min.js`;

const App = () => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [error, setError] = useState(null);

  function onDocumentLoadSuccess({ numPages }) {
    console.log('PDF loaded successfully');
    setNumPages(numPages);
    setError(null);
  }

  function onDocumentLoadError(error) {
    console.error('Error loading PDF:', error);
    setError(error.message);
  }

  return (
    <div style={{ height: "100vh", width: "100vw", padding: "20px" }}>
      <h1>PDF Reader</h1>
      <div style={{ marginBottom: "10px" }}>
        <span>
          Page {pageNumber} of {numPages}
        </span>
        <div style={{ marginTop: "10px" }}>
          <button 
            onClick={() => setPageNumber(pageNumber - 1)} 
            disabled={pageNumber <= 1}
            style={{ marginRight: "10px" }}
          >
            Previous
          </button>
          <button 
            onClick={() => setPageNumber(pageNumber + 1)} 
            disabled={pageNumber >= numPages}
            style={{ marginRight: "10px" }}
          >
            Next
          </button>
          <button 
            onClick={() => setScale(scale + 0.1)}
            style={{ marginRight: "10px" }}
          >
            Zoom In
          </button>
          <button 
            onClick={() => setScale(scale - 0.1)}
          >
            Zoom Out
          </button>
        </div>
      </div>
      <div style={{ height: "calc(100vh - 100px)", border: "1px solid #ccc", overflow: "auto" }}>
        <Document
          file={{
            url: "https://res.cloudinary.com/dxp30cxtd/image/upload/v1743165805/childrens-literature_2_j2pmxo.pdf",
            httpHeaders: {
              'Access-Control-Allow-Origin': '*'
            }
          }}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={<div style={{ padding: '20px' }}>Loading PDF...</div>}
          error={
            <div style={{ padding: '20px', color: 'red' }}>
              {error || 'Failed to load PDF. Please check the console for details.'}
            </div>
          }
          options={{
            cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.6.172/cmaps/',
            cMapPacked: true,
          }}
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </Document>
      </div>
    </div>
  );
};

export default App;