const Tag = ({ text }: { text: string }) => {
  return (
    <div className="self-center rounded-md border border-neutral-400 px-1 py-[2px] text-xs text-neutral-400 md:px-2 md:py-1">
      {text}
    </div>
  );
};

export default Tag;
