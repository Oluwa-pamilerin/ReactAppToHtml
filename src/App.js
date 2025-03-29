import React, { useState, useRef } from "react";
import { EpubViewer } from 'react-epub-viewer';

const App = () => {
  const [error, setError] = useState(null);
  const viewerRef = useRef(null);

  function onError(error) {
    console.error('Error loading EPUB:', error);
    setError(error.message);
  }

  return (
    <div style={{ height: "100vh", width: "100vw", padding: "20px" }}>
      <h1>EPUB Reader</h1>
      <div style={{ height: "calc(100vh - 100px)", border: "1px solid #ccc", overflow: "auto" }}>
        <EpubViewer
          ref={viewerRef}
          url="https://res.cloudinary.com/dxp30cxtd/raw/upload/v1743164895/childrens-literature_2_d64q6m.epub"
          onError={onError}
          loading={<div style={{ padding: '20px' }}>Loading EPUB...</div>}
          error={
            <div style={{ padding: '20px', color: 'red' }}>
              {error || 'Failed to load EPUB. Please check the console for details.'}
            </div>
          }
        />
      </div>
    </div>
  );
};

export default App;