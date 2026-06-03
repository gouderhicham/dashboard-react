const ProgressBarLoader = () => {
  return (
    <div
      role="progressbar"
      aria-label="Loading"
      className="fixed top-0 left-0 right-0 z-20 h-[3px] overflow-hidden bg-[--tw-primary]/20"
    >
      <div className="absolute inset-y-0 w-1/3 bg-[--tw-primary] opacity-50 animate-progress-indeterminate" />
    </div>
  );
};

export { ProgressBarLoader };
