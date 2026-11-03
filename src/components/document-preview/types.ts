/** One numbered part of a document: its heading, then its paragraphs. */
export type DocumentSection = {
  heading?: string;
  paragraphs: string[];
};
