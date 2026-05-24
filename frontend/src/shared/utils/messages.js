export const parseMessageContent = (content) => {
  if (!content || typeof content !== "string") {
    return [];
  }

  const parts = [];

  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;

  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const [fullMatch, language, code] = match;

    const start = match.index;

    if (start > lastIndex) {
      const textContent = content.slice(lastIndex, start);

      if (textContent) {
        parts.push({
          type: "text",
          content: textContent,
        });
      }
    }

    const cleanedCode = code.replace(/\n$/, "");

    if (cleanedCode.trim()) {
      parts.push({
        type: "code",
        language: language || null,
        content: cleanedCode,
      });
    }

    lastIndex = start + fullMatch.length;
  }

  if (lastIndex < content.length) {
    const remainingText = content.slice(lastIndex);

    if (remainingText) {
      parts.push({
        type: "text",
        content: remainingText,
      });
    }
  }

  if (parts.length === 0) {
    return [
      {
        type: "text",
        content,
      },
    ];
  }

  return parts;
};
