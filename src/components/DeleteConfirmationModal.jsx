// frontend/src/components/DeleteConfirmationModal.jsx

import { motion, AnimatePresence } from 'framer-motion';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import PropTypes from 'prop-types';

/**
 * A modal dialog for confirming deletion actions.
 * 
 * @param {Object} props - Component props
 * @param {string} props.conversationTitle - The title of the conversation to be deleted
 * @param {Function} props.onConfirm - Callback when deletion is confirmed
 * @param {Function} props.onCancel - Callback when deletion is canceled
 * @returns {JSX.Element} Delete confirmation modal component
 */
const DeleteConfirmationModal = ({ conversationTitle, onConfirm, onCancel }) => {
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-confirmation-heading"
      >
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 20, opacity: 0 }}
          transition={{ ease: "easeInOut", duration: 0.2 }}
          className="relative m-4 w-full max-w-md rounded-xl bg-surface p-6 shadow-xl border border-border"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
              <ExclamationTriangleIcon 
                className="h-6 w-6 text-red-400" 
                aria-hidden="true" 
              />
            </div>
            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
              <h3 
                id="delete-confirmation-heading"
                className="text-base font-semibold leading-6 text-content-primary"
              >
                Delete Conversation
              </h3>
              <div className="mt-2">
                <p className="text-sm text-content-secondary">
                  Are you sure you want to delete "{conversationTitle}"? This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse space-x-3 space-x-reverse">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 sm:ml-3 sm:w-auto transition-colors"
              onClick={onConfirm}
              aria-label="Confirm deletion"
            >
              Delete
            </button>
            <button
              type="button"
              className="mt-3 inline-flex w-full justify-center rounded-md bg-white/5 px-4 py-2 text-sm font-semibold text-content-primary shadow-sm ring-1 ring-inset ring-border hover:bg-white/10 focus:outline-none sm:mt-0 sm:w-auto transition-colors"
              onClick={onCancel}
              aria-label="Cancel deletion"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

DeleteConfirmationModal.propTypes = {
  conversationTitle: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default DeleteConfirmationModal;