import html2canvas from "html2canvas";

export const captureChart = async (element: HTMLElement) => {
  const canvas = await html2canvas(element, {
    scale: 3,
    backgroundColor: null,
    useCORS: true,
    logging: false,
  });
  return canvas.toDataURL("image/png");
};
