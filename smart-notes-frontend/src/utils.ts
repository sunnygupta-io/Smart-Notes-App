// Helper to convert HTML to clean plain text for card previews
export const getPlainTextPreview = (htmlString: string | null | undefined) => {
  if (!htmlString) return "";
  
  // 1. Add a space before opening tags so block elements don't squish words together 
  // (e.g. </h1><p> becomes "Title Text" instead of "TitleText")
  const spacedHtml = htmlString.replace(/</g, ' <');
  
  // 2. Safely parse the HTML using the browser's built-in parser
  const doc = new DOMParser().parseFromString(spacedHtml, 'text/html');
  
  // 3. Extract the text and collapse any double spaces into a single space
  return (doc.body.textContent || "").replace(/\s+/g, ' ').trim();
};