import React from 'react';
import { BookingStatus } from '../../types';

interface StatusBadgeProps {
  status: BookingStatus;
  size?: 'sm' | 'md' | 'lg';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = (status: BookingStatus) => {
    switch (status) {
      case 'pending':
        return {
          label: 'Pending',
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          dot: 'bg-yellow-400'
        };
      case 'assigned':
        return {
          label: 'Assigned',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          dot: 'bg-blue-400'
        };
      case 'pickup':
        return {
          label: 'En Route',
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          dot: 'bg-orange-400'
        };
      case 'drop':
        return {
          label: 'In Transit',
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          dot: 'bg-purple-400'
        };
      case 'completed':
        return {
          label: 'Completed',
          color: 'bg-green-100 text-green-800 border-green-200',
          dot: 'bg-green-400'
        };
      case 'cancelled':
        return {
          label: 'Cancelled',
          color: 'bg-red-100 text-red-800 border-red-200',
          dot: 'bg-red-400'
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          dot: 'bg-gray-400'
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span className={`inline-flex items-center space-x-2 rounded-full border font-medium ${config.color} ${sizeClasses[size]}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
      <span>{config.label}</span>
    </span>
  );
};

export default StatusBadge;