import React, { useState, useEffect, useRef } from 'react';
import ePub from 'epubjs';

const App = () => {
  const [error, setError] = useState(null);
  const [file, setFile] = useState(null);
  const [book, setBook] = useState(null);
  const [rendition, setRendition] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(0);
  const [totalLocations, setTotalLocations] = useState(0);
  const [fontSize, setFontSize] = useState(100);
  const [theme, setTheme] = useState('light');
  const viewerRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const loadBook = async () => {
      if (file && viewerRef.current) {
        try {
          // Create new book with specific options
          const newBook = ePub(file, {
            openAs: 'epub',
            restore: false,
            flow: 'paginated',
            spread: 'none',
            minSpreadWidth: 800,
            allowScripts: false
          });

          // Wait for book to be ready
          await newBook.ready;
          
          if (!mounted) return;
          setBook(newBook);

          // Create rendition with specific options
          const newRendition = newBook.renderTo(viewerRef.current, {
            width: '100%',
            height: '100%',
            spread: 'none',
            flow: 'paginated'
          });

          // Set default styles
          newRendition.themes.default({
            body: {
              'padding': '20px',
              'font-size': `${fontSize}%`,
              'line-height': '1.6'
            }
          });

          // Set theme
          newRendition.themes.select(theme);

          // Display the book
          await newRendition.display();

          // Get total locations
          const locations = await newBook.locations.generate(1000);
          if (!mounted) return;
          setTotalLocations(locations.total);

          // Set up location change handler
          newRendition.on('locationChanged', (location) => {
            if (!mounted) return;
            const currentPage = location.start.displayed.page;
            const totalPages = location.start.displayed.total;
            setCurrentLocation(currentPage);
            setTotalLocations(totalPages);
          });

          // Set up navigation handlers
          newRendition.on('keyup', (event) => {
            if (event.key === 'ArrowRight') {
              newRendition.next();
            }
            if (event.key === 'ArrowLeft') {
              newRendition.prev();
            }
          });

          // Set up touch events for mobile
          let touchStartX = 0;
          newRendition.on('touchstart', (event) => {
            touchStartX = event.touches[0].clientX;
          });

          newRendition.on('touchend', (event) => {
            const touchEndX = event.changedTouches[0].clientX;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > 50) { // Minimum swipe distance
              if (diff > 0) {
                newRendition.next();
              } else {
                newRendition.prev();
              }
            }
          });

          if (!mounted) return;
          setRendition(newRendition);
          setError(null);

        } catch (err) {
          console.error('Error loading book:', err);
          if (!mounted) return;
          setError('Failed to load the book. Please try again.');
        }
      }
    };

    loadBook();

    return () => {
      mounted = false;
      if (rendition) {
        rendition.destroy();
      }
      if (book) {
        book.destroy();
      }
    };
  }, [file, fontSize, theme]);

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile && (uploadedFile.type === 'application/epub+zip' || uploadedFile.type === 'application/epub')) {
      const fileUrl = URL.createObjectURL(uploadedFile);
      setFile(fileUrl);
      setError(null);
    } else {
      setError('Please upload a valid EPUB file');
      setFile(null);
    }
  };

  const handlePrevPage = async () => {
    if (rendition) {
      try {
        await rendition.prev();
      } catch (err) {
        console.error('Error navigating to previous page:', err);
      }
    }
  };

  const handleNextPage = async () => {
    if (rendition) {
      try {
        await rendition.next();
      } catch (err) {
        console.error('Error navigating to next page:', err);
      }
    }
  };

  const handleFontSizeChange = (delta) => {
    setFontSize(prev => Math.max(50, Math.min(200, prev + delta)));
  };

  const handleThemeChange = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div style={{ height: "100vh", width: "100vw", padding: "20px" }}>
      <h1>EPUB Reader</h1>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="file"
          accept=".epub"
          onChange={handleFileUpload}
          style={{ marginBottom: "10px" }}
        />
        {error && (
          <div style={{ color: 'red', marginTop: '10px' }}>
            {error}
          </div>
        )}
      </div>
      {file && (
        <div style={{ marginBottom: "10px" }}>
          <span>
            Page {currentLocation} of {totalLocations}
          </span>
          <div style={{ marginTop: "10px" }}>
            <button 
              onClick={handlePrevPage}
              style={{ marginRight: "10px", padding: "8px 16px", cursor: "pointer" }}
            >
              Previous
            </button>
            <button 
              onClick={handleNextPage}
              style={{ marginRight: "10px", padding: "8px 16px", cursor: "pointer" }}
            >
              Next
            </button>
            <button 
              onClick={() => handleFontSizeChange(-10)}
              style={{ marginRight: "10px", padding: "8px 16px", cursor: "pointer" }}
            >
              Smaller Text
            </button>
            <button 
              onClick={() => handleFontSizeChange(10)}
              style={{ marginRight: "10px", padding: "8px 16px", cursor: "pointer" }}
            >
              Larger Text
            </button>
            <button 
              onClick={handleThemeChange}
              style={{ padding: "8px 16px", cursor: "pointer" }}
            >
              Toggle Theme
            </button>
          </div>
        </div>
      )}
      <div style={{ 
        height: "calc(100vh - 200px)", 
        border: "1px solid #ccc",
        overflow: "auto",
        backgroundColor: theme === 'light' ? "#fff" : "#333"
      }}>
        {file ? (
          <div 
            ref={viewerRef}
            style={{ 
              width: "100%",
              height: "100%",
              overflow: "hidden"
            }}
          />
        ) : (
          <div style={{ 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#666'
          }}>
            Upload an EPUB file to start reading
          </div>
        )}
      </div>
    </div>
  );
}

export default BasicExample;