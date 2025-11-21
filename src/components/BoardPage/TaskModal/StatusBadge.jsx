export const StatusBadge = ({ status, onClick }) => {
  const statusConfig = {
    'In Progress': {
      color: 'text-primary-600 bg-primary-50 border-primary-200',
      icon: '◉',
    },
    'Completed': {
      color: 'text-success-600 bg-success-50 border-success-200',
      icon: '✓',
    },
    'Not Started': {
      color: 'text-neutral-600 bg-neutral-50 border-neutral-200',
      icon: '○',
    },
    'Blocked': {
      color: 'text-error-600 bg-error-50 border-error-200',
      icon: '⊗',
    },
    'In Review': {
      color: 'text-warning-600 bg-warning-50 border-warning-200',
      icon: '👁',
    },
  };

  const config = statusConfig[status] || statusConfig['Not Started'];

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${config.color} hover:opacity-80`}
    >
      <span className="text-xs">{config.icon}</span>
      {status}
    </button>
  );
};
