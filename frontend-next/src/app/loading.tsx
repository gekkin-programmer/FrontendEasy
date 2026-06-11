import SpinningLoader from "@/components/SpinningLoader";

export default function Loading() {
  // This automatically shows whenever Next.js is fetching data for a new page
  return <SpinningLoader fullScreen={true} />;
}