import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';
import emailjs from '@emailjs/browser';

// EmailJS configuration (same as ContactPage and Newsletter)
const EMAILJS_PUBLIC_KEY = "0f8Jce-Gsw4GbjCQ_";
const EMAILJS_SERVICE_ID = "service_m4uai4d";
const EMAILJS_TEMPLATE_ID = "template_km1j8qq";

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

const FeedbackModal = ({ isOpen, onClose }) => {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Lock body scroll when modal is open and handle ESC key
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      // Handle ESC key to close modal
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
      };
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormState({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
      setSubmitted(false);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Send email using EmailJS with matching template parameters
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          title: formState.subject || 'Feedback',
          name: formState.name,
          time: new Date().toLocaleString(),
          message: formState.message,
          email: formState.email,
          reply_to: formState.email
        }
      );
      
      setSubmitted(true);
      setFormState({
        name: '',
        email: '',
        subject: '',
        message: ''
      });

      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to send email:', error);
      alert('Przepraszamy, wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie później.');
    } finally {
      setSubmitting(false);
    }
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      }
    },
    exit: { 
      opacity: 0,
      transition: { 
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  const modalVariants = {
    hidden: { 
      y: 20, 
      opacity: 0,
      scale: 0.95
    },
    visible: { 
      y: 0, 
      opacity: 1,
      scale: 1,
      transition: { 
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.4
      }
    },
    exit: { 
      y: 10, 
      opacity: 0,
      scale: 0.98,
      transition: { 
        duration: 0.2,
        ease: "easeOut"
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 flex items-center justify-center bg-black/80 z-[100] p-2 sm:p-4 backdrop-blur-sm"
          onClick={onClose}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <motion.div 
            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-2xl mx-auto relative overflow-hidden"
            onClick={e => e.stopPropagation()}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ 
              maxHeight: 'calc(100vh - 32px)',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            {/* Decorative background elements */}
            <div className="absolute -left-20 -top-20 w-40 h-40 rounded-full bg-green-100 blur-2xl opacity-50"></div>
            <div className="absolute right-0 bottom-0 w-60 h-60 rounded-full bg-green-50 blur-3xl opacity-40"></div>

            {/* Close button - higher z-index and larger touch target on mobile */}
            <motion.button
              className="absolute right-2 top-2 sm:right-4 sm:top-4 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-700 transition-colors shadow-lg z-50 touch-manipulation"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose();
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Zamknij"
              type="button"
            >
              <IoClose className="text-xl sm:text-2xl" />
            </motion.button>

            {/* Modal Content */}
            <div className="relative z-10 p-4 sm:p-6 md:p-8">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="pr-8 sm:pr-12"
              >
                <h2 className="text-2xl sm:text-3xl font-['Patrick_Hand'] text-gray-800 mb-2">
                  Podziel się opinią
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  Twoja opinia jest dla nas bardzo ważna. Pomóż nam ulepszać treści na stronie.
                </p>
              </motion.div>

              {submitted ? (
                <motion.div 
                  className="bg-green-50 border border-green-200 rounded-xl p-4 sm:p-6 text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <svg className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <h3 className="text-xl sm:text-2xl font-['Patrick_Hand'] text-gray-800 mb-2">Dziękujemy!</h3>
                  <p className="text-sm sm:text-base text-gray-600">Twoja wiadomość została wysłana. Odpowiemy najszybciej jak to możliwe.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label htmlFor="feedback-name" className="block text-sm sm:text-base text-gray-700 mb-2 font-medium">
                        Imię i nazwisko
                      </label>
                      <input
                        type="text"
                        id="feedback-name"
                        name="name"
                        value={formState.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 touch-manipulation"
                        placeholder="Twoje imię"
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label htmlFor="feedback-email" className="block text-sm sm:text-base text-gray-700 mb-2 font-medium">
                        Email
                      </label>
                      <input
                        type="email"
                        id="feedback-email"
                        name="email"
                        value={formState.email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 touch-manipulation"
                        placeholder="Twój email"
                        aria-required="true"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="feedback-subject" className="block text-sm sm:text-base text-gray-700 mb-2 font-medium">
                      Temat
                    </label>
                    <input
                      type="text"
                      id="feedback-subject"
                      name="subject"
                      value={formState.subject}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 touch-manipulation"
                      placeholder="Temat wiadomości"
                      aria-required="true"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="feedback-message" className="block text-sm sm:text-base text-gray-700 mb-2 font-medium">
                      Wiadomość
                    </label>
                    <textarea
                      id="feedback-message"
                      name="message"
                      value={formState.message}
                      onChange={handleChange}
                      required
                      rows="5"
                      className="w-full px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-200 resize-none touch-manipulation"
                      placeholder="Twoja wiadomość..."
                      aria-required="true"
                    ></textarea>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onClose();
                      }}
                      className="flex-1 px-4 sm:px-6 py-3 text-sm sm:text-base rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 active:bg-gray-100 transition-colors duration-300 touch-manipulation"
                    >
                      Anuluj
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`flex-1 bg-green-600 text-white py-3 px-4 sm:px-6 text-sm sm:text-base rounded-lg font-semibold hover:bg-green-500 active:bg-green-700 transition-colors duration-300 touch-manipulation ${submitting ? 'opacity-70 cursor-wait' : ''}`}
                      aria-disabled={submitting}
                    >
                      {submitting ? "Wysyłanie..." : "Wyślij wiadomość"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackModal;

