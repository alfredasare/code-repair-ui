import { Spinner } from "./spinner";

interface FullScreenLoaderProps {
  text?: string;
}

export function FullScreenLoader({ text }: FullScreenLoaderProps) {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
      <Spinner size="lg" color="black" text={text} />
    </div>
  );
}