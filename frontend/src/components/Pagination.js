import React from 'react';

export default function Pagination({ 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange, 
  itemsPerPage,
  totalItems
}) {
  const getPageNumbers = () => {
    const pages = [];
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);

    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  const pages = getPageNumbers();

  return (
    <nav aria-label="Page navigation" className="d-flex justify-content-center mt-5 mb-5">
      <ul className="pagination">
        {/* Previous Button */}
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            ← Previous
          </button>
        </li>

        {/* First Page */}
        {pages[0] > 1 && (
          <>
            <li className="page-item">
              <button
                className="page-link"
                onClick={() => onPageChange(1)}
              >
                1
              </button>
            </li>
            {pages[0] > 2 && (
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            )}
          </>
        )}

        {/* Page Numbers */}
        {pages.map((page) => (
          <li
            key={page}
            className={`page-item ${currentPage === page ? 'active' : ''}`}
          >
            <button
              className="page-link"
              onClick={() => onPageChange(page)}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          </li>
        ))}

        {/* Last Page */}
        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && (
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            )}
            <li className="page-item">
              <button
                className="page-link"
                onClick={() => onPageChange(totalPages)}
              >
                {totalPages}
              </button>
            </li>
          </>
        )}

        {/* Next Button */}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <button
            className="page-link"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            Next →
          </button>
        </li>
      </ul>
    </nav>
  );
}
