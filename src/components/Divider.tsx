const DateDivider = ({ label }: { label: string }) => {
  return (
    <div className="flex items-center justify-center my-4">
      <span className="bg-muted text-xs text-muted-foreground px-3 py-1 rounded-full shadow-sm">
        {label}
      </span>
    </div>
  );
};

export default DateDivider;