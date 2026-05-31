import React from 'react';
import ReactMarkdown from 'react-markdown';
import '../styles/components/ai-chat.css'

function AiResponseDisplay({ aiStreamedText }) {
  return (
    <div className="wealthflow-ai-response">
      {/* ReactMarkdown automatically translates **, |, and * into <strong>, <table>, and <li> */}
      <ReactMarkdown>{aiStreamedText}</ReactMarkdown>
    </div>
  );
}

export default AiResponseDisplay;