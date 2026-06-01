export const ACTIVITY_IDS = [8, 6, 3, 10];
export const POPULAR_IDS = [1, 3, 5, 7, 9, 11, 12, 13];

export const TOURISM_BASE_URL = "https://tourism-api-sha-e7g5guagcdc2dddv.westeurope-01.azurewebsites.net";

export const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.48, delay: i * 0.11, ease: "easeOut" },
});
