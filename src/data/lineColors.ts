export const LINE_COLORS: Record<string, string> = {
  "1": "#FFCE00",
  "2": "#0064B0",
  "3": "#9F9825",
  "3bis": "#98D4E2",
  "4": "#C04191",
  "5": "#F28E42",
  "6": "#83C491",
  "7": "#F3A4BA",
  "7bis": "#83C491",
  "8": "#CEADD2",
  "9": "#D5C900",
  "10": "#E3B32A",
  "11": "#8D5E2A",
  "12": "#00814F",
  "13": "#98D4E2",
  "14": "#662483",
};

export function lineColor(line: string): string {
  return LINE_COLORS[line] ?? "#999999";
}
