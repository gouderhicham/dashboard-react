const ContentLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center self-center relative top-1/2 -translate-x-1/2">
      <div
        role="status"
        aria-label="Loading"
        className="h-10 w-10 rounded-full border-4 border-[--tw-primary] border-t-transparent animate-spin"
      />
    </div>
  );
};

export { ContentLoader };
