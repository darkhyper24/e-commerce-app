import React, { useState } from 'react';
import Navbar from '../components/Navbar';

const faqs = [
  {
    question: 'What is Smart.cart?',
    answer: 'Smart.cart is an e-commerce platform specializing in the latest hardware tech products.'
  },
  {
    question: 'How do I place an order?',
    answer: 'Browse our products, add items to your cart, and proceed to checkout. You will need to register or log in to complete your purchase.'
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept credit/debit cards, UPI, and net banking.'
  },
  {
    question: 'How can I track my order?',
    answer: 'After your order is shipped, you will receive a tracking link via email and in your profile.'
  },
  {
    question: 'What is your return policy?',
    answer: 'You can return most items within 7 days of delivery. Please see our Returns page for details.'
  },
  {
    question: 'How do I contact support?',
    answer: 'You can reach our support team via the Contact Us page or by emailing support@smartcart.com.'
  }
];

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = idx => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div style={{ background: '#181A1B', minHeight: '100vh' }}>
      <Navbar onSearch={() => {}} onLogout={() => {}} />
      <div style={containerStyle}>
        <h1 style={{ color: '#ff9800', fontSize: 36, marginBottom: 32 }}>Frequently Asked Questions</h1>
        <div style={faqListStyle}>
          {faqs.map((faq, idx) => (
            <div key={idx} style={faqItemStyle}>
              <button
                onClick={() => handleToggle(idx)}
                style={{
                  ...questionStyle,
                  width: '100%',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  outline: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 0
                }}
                aria-expanded={openIndex === idx}
                aria-controls={`faq-answer-${idx}`}
              >
                {faq.question}
                <span style={{ fontSize: 22, color: '#ff9800', marginLeft: 12 }}>
                  {openIndex === idx ? '−' : '+'}
                </span>
              </button>
              <div
                id={`faq-answer-${idx}`}
                style={{
                  ...answerStyle,
                  maxHeight: openIndex === idx ? 200 : 0,
                  opacity: openIndex === idx ? 1 : 0,
                  marginTop: openIndex === idx ? 12 : 0,
                  transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
                  overflow: 'hidden',
                }}
              >
                {openIndex === idx && <div>{faq.answer}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const containerStyle = {
  padding: '64px 24px',
  textAlign: 'center',
};
const faqListStyle = { maxWidth: 700, margin: '0 auto' };
const faqItemStyle = {
  background: '#232526',
  borderRadius: 12,
  marginBottom: 28,
  padding: '24px 20px',
  boxShadow: '0 2px 12px #0006',
  textAlign: 'left',
};
const questionStyle = { color: '#ff9800', fontSize: 20, fontWeight: 700, marginBottom: 8 };
const answerStyle = { color: '#fff', fontSize: 17, transition: 'all 0.3s cubic-bezier(.4,0,.2,1)' };

export default FAQs; 