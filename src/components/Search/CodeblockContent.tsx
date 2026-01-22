
import React from 'react';

interface CodeblockContentProps {
  content: string;
  isBlurred?: boolean;
}

const CodeblockContent: React.FC<CodeblockContentProps> = ({ content, isBlurred }) => {
  return (
    <pre className={`p-4 rounded-md overflow-x-auto overflow-y-auto text-sm font-mono bg-[#1D1832] max-h-[480px] ${
      isBlurred ? 'opacity-60 select-none pointer-events-none' : ''
    }`}>
      <code>{content}</code>
    </pre>
  );
};

export default CodeblockContent;
