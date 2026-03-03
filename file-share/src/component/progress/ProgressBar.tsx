export const ProgressBar: React.FC<{ percent: number }> = ({ percent }) => {
  return (
    <div className="progress">
      <div className="bar" style={{ width: `${percent}%` }}></div>
    </div>
  );
};

export const ProgressBarSkeleton = () => {
  return <div className="progressbar-skeleton"></div>;
};
