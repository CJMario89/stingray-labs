const Tag = ({ text }: { text: string }) => {
  return (
    <div className="self-center rounded-md border border-neutral-400 px-2 py-1 text-xs text-neutral-400">
      {text}
    </div>
  );
};

export default Tag;
