import React from 'react';

const Pagination = ({ meta, setPage }) => {
  const { currentPage, totalPages } = meta;

  const pages = [];
  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex justify-between items-center mt-4">
      <button
        onClick={() => setPage((p) => Math.max(p - 1, 1))}
        disabled={currentPage === 1}
        className="btn-secondary disabled:bg-gray-300"
      >
        Previous
      </button>
      <div className="flex space-x-2">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => setPage(page)}
            className={`px-3 py-1 rounded ${
              page === currentPage ? 'bg-primary text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {page}
          </button>
        ))}
      </div>
      <button
        onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="btn-secondary disabled:bg-gray-300"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;