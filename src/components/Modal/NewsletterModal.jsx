/**
 * NewsletterModal Component - Newsletter subscription modal for user email collection
 * 
 * PURPOSE:
 * This modal displays a newsletter subscription form that allows users to sign up for email
 * notifications about new recipes and exclusive tips. It integrates with EmailJS service to
 * send subscription data via email. The modal appears automatically based on user behavior
 * or can be triggered manually from various components.
 * 
 * USAGE LOCATIONS:
 * - src/components/Pages/Recipe/RecipePage.jsx
 *    * Automatically opens after user opens 5 different recipes (tracked in localStorage)
 *    * Automatically opens for "mieszanka-2" recipe (special promotion)
 *    * Can be opened manually via RecipeNewsletterCTA component
 * - src/components/Pages/Category/CategoryPage.jsx
 *    * Can be triggered from links in category descriptions (e.g., "optymalną domową mieszankę")
 *    * Opens with pending navigation to specific recipe after subscription
 * 
 * HOW IT WORKS:
 * 1. Opens/closes via props: isOpen (boolean), onClose (function), onSuccess (function)
 * 2. Collects user data:
 *    * Name (required text input)
 *    * Email address (required email input)
 * 3. Submits data via EmailJS service:
 *    * Uses EmailJS Public Key, Service ID, and Template ID
 *    * Sends subscription notification email to website owner
 * 4. Success handling:
 *    * Shows success message with checkmark icon
 *    * Calls onSuccess callback after 2 seconds
 *    * Stores subscription status in localStorage to prevent repeated prompts
 * 5. Error handling:
 *    * Displays user-friendly error messages if submission fails
 *    * Allows retry without closing modal
 * 
 * FEATURES:
 *   - Smooth animations using framer-motion (spring animations, fade transitions)
 *   - Responsive design (mobile and desktop layouts)
 *   - Decorative animated background elements (green gradient circles)
 *   - Form validation (required fields, email format)
 *   - Loading states (disabled inputs during submission, spinner animation)
 *   - Success state with animated checkmark
 *   - Error state with clear error messages
 *   - Click outside to close functionality
 *   - Keyboard accessible close button
 *   - High z-index (20000) to appear above all other elements including sidebar buttons
 *   - Privacy note about email consent
 *   - Prevents closing during form submission
 * 
 * CONTENT DISPLAYED:
 *   - Welcome message: "Dołącz do naszej społeczności!"
 *   - Description about recipe notifications and exclusive tips
 *   - Form fields: Name and Email inputs
 *   - Submit button with loading state
 *   - Success message: "Dziękujemy za zapis!"
 *   - Privacy consent note
 * 
 * PROPS:
 *   - isOpen: boolean - Controls modal visibility
 *   - onClose: function - Function called when modal is closed (click outside, close button, or ESC)
 *   - onSuccess: function (optional) - Function called after successful subscription (2 second delay)
 * 
 * LOCAL STORAGE:
 *   - 'newsletter_subscribed': 'true' - Set by parent components to prevent repeated prompts
 * 
 * EMAILJS INTEGRATION:
 *   - Public Key: "0f8Jce-Gsw4GbjCQ_"
 *   - Service ID: "service_m4uai4d"
 *   - Template ID: "template_km1j8qq"
 *   - Sends: title, name, email, message, timestamp
 * 
 * ANIMATIONS:
 *   - Backdrop fade in/out (opacity transition)
 *   - Modal spring animation (scale, translateY)
 *   - Success message scale animation
 *   - Close button hover/tap animations (scale, rotate)
 *   - Submit button hover/tap animations
 *   - Decorative background elements (static blur effects)
 * 
 * Z-INDEX HIERARCHY:
 *   - Modal backdrop: z-[20000] (highest - appears above everything)
 *   - StickyIngredientsSidebar button: z-[10000] (when modal closed) or z-[5000] (when modal open)
 *   - Other modals: z-[100] or z-50
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaEnvelope, FaCheckCircle } from 'react-icons/fa';
import emailjs from '@emailjs/browser';

const NewsletterModal = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  // EmailJS configuration
  const EMAILJS_PUBLIC_KEY = "0f8Jce-Gsw4GbjCQ_";
  const EMAILJS_SERVICE_ID = "service_m4uai4d";
  const EMAILJS_TEMPLATE_ID = "template_km1j8qq";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      emailjs.init(EMAILJS_PUBLIC_KEY);
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          title: "Newsletter Subscription",
          name: name,
          email: email,
          reply_to: email,
          message: `Nowy użytkownik zapisał się do newslettera. Email: ${email}`,
          time: new Date().toLocaleString(),
        }
      );
      
      setSubmitted(true);
      setName('');
      setEmail('');
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      console.error("Newsletter subscription error:", err);
      setError("Wystąpił błąd podczas zapisu. Spróbuj ponownie później.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setName('');
      setEmail('');
      setError('');
      setSubmitted(false);
      onClose();
    }
  };

  // Backdrop variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  // Modal variants
  const modalVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.9,
      y: 20
    },
    visible: { 
      opacity: 1, 
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300
      }
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      y: 20,
      transition: {
        duration: 0.2
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Higher z-index than sidebar button (10000) */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[20000] flex items-center justify-center p-4"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleClose}
          >
            {/* Modal */}
            <motion.div
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto relative overflow-hidden"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative background elements */}
              <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full bg-green-100 blur-3xl opacity-50"></div>
              <div className="absolute -left-12 -bottom-12 w-32 h-32 rounded-full bg-green-50 blur-2xl opacity-40"></div>

              {/* Close button */}
              <motion.button
                className="absolute right-3 top-3 sm:right-4 sm:top-4 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 transition-colors z-50 touch-manipulation"
                onClick={handleClose}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Zamknij"
                disabled={submitting}
              >
                <FaTimes className="text-lg sm:text-xl" />
              </motion.button>

              {/* Content */}
              <div className="relative z-10 p-6 sm:p-8">
                {/* Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
                    <FaEnvelope className="text-white text-2xl sm:text-3xl" />
                  </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center mb-2 font-['Playfair_Display']">
                  Dołącz do naszej społeczności!
                </h2>

                {/* Description */}
                <p className="text-sm sm:text-base text-gray-600 text-center mb-6 leading-relaxed">
                  Odkryj więcej przepisów dostosowanych do potrzeb dzieci z autyzmem. 
                  Otrzymuj powiadomienia o nowych przepisach i ekskluzywne porady prosto na swoją skrzynkę.
                </p>

                {/* Success message */}
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center"
                  >
                    <FaCheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <div className="text-green-700 font-semibold text-lg mb-2">
                      Dziękujemy za zapis!
                    </div>
                    <div className="text-green-600 text-sm">
                      Sprawdź swoją skrzynkę email.
                    </div>
                  </motion.div>
                ) : (
                  <>
                    {/* Error message */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-red-700 text-sm text-center">
                        {error}
                      </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div>
                        <label htmlFor="newsletter-name" className="block text-sm font-medium text-gray-700 mb-2">
                          Twoje imię
                        </label>
                        <input
                          id="newsletter-name"
                          type="text"
                          placeholder="Wpisz swoje imię"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          disabled={submitting}
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all duration-300 text-base placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label htmlFor="newsletter-email" className="block text-sm font-medium text-gray-700 mb-2">
                          Twój adres email
                        </label>
                        <input
                          id="newsletter-email"
                          type="email"
                          placeholder="twoj@email.pl"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={submitting}
                          className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all duration-300 text-base placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>

                      <motion.button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3.5 rounded-lg transition-all duration-300 font-semibold text-base shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        whileHover={{ scale: submitting ? 1 : 1.02 }}
                        whileTap={{ scale: submitting ? 1 : 0.98 }}
                      >
                        {submitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Zapisywanie...</span>
                          </>
                        ) : (
                          <>
                            <span>Zapisz się do newslettera</span>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                          </>
                        )}
                      </motion.button>
                    </form>

                    {/* Privacy note */}
                    <p className="mt-4 text-xs text-gray-500 text-center leading-relaxed">
                      Dołączając do newslettera, zgadzasz się na otrzymywanie od nas wiadomości email. 
                      Możesz zrezygnować w każdej chwili.
                    </p>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NewsletterModal;

